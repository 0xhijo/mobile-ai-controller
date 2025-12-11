import {
  MessagesAnnotation,
  StateGraph,
  START,
  END,
  CompiledStateGraph,
  AnnotationRoot,
} from '@langchain/langgraph';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import {
  createAgent,
  HumanMessage,
  ReactAgent,
  SystemMessage,
} from 'langchain';
import mcpsIngester from '../ingesters/mcps/mcps.ingester.js';
import { DeviceInfo, MobileControler } from '../mobile/index.js';
import { getUserQuery, selectDevices } from '../utils/index.js';
import { createDeviceCheckMiddleware } from './middleware/devices.middleware.js';

export class MobileControllerGraph {
  // Graph implementation for MobileControllerGraph
  graph: CompiledStateGraph<
    AnnotationRoot<any>['State'],
    AnnotationRoot<any>['Update'],
    string,
    AnnotationRoot<any>['spec'],
    AnnotationRoot<any>['spec']
  > | null = null;

  agent: ReactAgent | null = null;

  model: ChatGoogleGenerativeAI;

  mobileController: MobileControler | null = null;
  constructor() {
    if (!process.env.GOOGLE_GENAI_API_KEY) {
      throw new Error(
        'GOOGLE_GENAI_API_KEY is not set in environment variables'
      );
    }
    this.model = new ChatGoogleGenerativeAI({
      temperature: 0.7,
      model: 'gemini-2.5-pro',
      apiKey: process.env.GOOGLE_GENAI_API_KEY,
    });
  }

  /**
   * init
   */
  public async init(): Promise<void> {
    // Define the graph structure and compile it
    await mcpsIngester.init();
    const tools = mcpsIngester.getTools();
    this.mobileController = new MobileControler(tools);
    const devices = await this.mobileController.getDevices();
    if (devices.length === 0) {
      throw new Error('No devices available');
    }
    const selectedDevices: DeviceInfo =
      devices.length === 1 ? devices[0] : await selectDevices(devices);
    this.agent = createAgent({
      model: this.model,

      tools: tools, // Define tools if any
      middleware: [createDeviceCheckMiddleware(this.mobileController)],
      systemPrompt: new SystemMessage({
        content: [
          `You are controlling phone {device : ${selectedDevices.id}}. Act as a human user would.`,
          '',
          'Task: Take a 15-minute break starting at {startTime}.',
          '- Use apps naturally (social media, messaging, browsing)',
          '- Scroll, tap, and interact like a real person',
          '- Take realistic pauses between actions',
          '- End the break after 15 minutes',
          '- Before switching tasks/activity make sure that your previous task is fully completed.(eg : If you want to send a messages make sure that its sended before switching to another app)',
        ].join('\n'),
      }),
    });
  }

  public async runAgent(): Promise<void> {
    if (!this.agent) {
      throw new Error('Agent not initialized');
    }
    while (-1) {
      const userQuery = await getUserQuery();
      if (userQuery === '-1') {
        console.log('Stopping agent as per user request.');
        break;
      }
      const response = await this.agent.invoke(
        {
          messages: [new HumanMessage(userQuery)],
        },
        {
          recursionLimit: 100,
        }
      );
      console.log('Agent response:', response);
    }
  }
}

// Singleton instance
let instance: MobileControllerGraph | null = null;

export function getMobileControllerGraph(): MobileControllerGraph {
  if (!instance) {
    instance = new MobileControllerGraph();
  }
  return instance;
}
