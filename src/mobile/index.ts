import { DynamicStructuredTool } from 'langchain';

export interface DeviceInfo {
  id: string;
  name: string;
  platform: string;
  type: string;
  version: string;
  state: string;
}

export class MobileControler {
  private tools: DynamicStructuredTool[];
  constructor(tools: DynamicStructuredTool[]) {
    this.tools = tools;
  }

  public async getDevices(): Promise<DeviceInfo[]> {
    try {
      const listMobileTool = this.tools.find(
        tool => tool.name === 'mobile_list_available_devices'
      );
      console.log('mobileTool', listMobileTool);
      console.log('schema:', JSON.stringify(listMobileTool?.schema, null, 2));
      if (!listMobileTool) {
        throw new Error('Tool mobile_list_available_devices not found');
      }
      const listDevices = await listMobileTool.invoke({ noParams: {} });
      if (!listDevices) {
        throw new Error('Error invoking mobile_list_available_devices tool');
      }
      const devices = JSON.parse(listDevices);
      return devices.devices as DeviceInfo[];
    } catch (error) {
      throw error;
    }
  }
}
