import { createMiddleware, AIMessage } from 'langchain';
import { MobileControler } from '../../mobile';

export const createDeviceCheckMiddleware = (mobileController: MobileControler) => {
  return createMiddleware({
    name: 'MessageLimitMiddleware',
    beforeModel: async state => {
      const devices = await waitForDevices(mobileController);
      if (devices.length === 0) {
        throw new Error('No devices available after 5 minutes timeout');
      }
      return state;
    },
  });
};

async function waitForDevices(
  mobileController: MobileControler
): Promise<any[]> {
  const TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
  const CHECK_INTERVAL_MS = 10 * 1000; // 10 seconds

  // Create a timeout promise
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error('Timeout: No devices found after 5 minutes'));
    }, TIMEOUT_MS);
  });

  // Create a polling promise
  const pollingPromise = new Promise<any[]>(async (resolve, reject) => {
    console.log('🔍 Waiting for devices to become available...');

    while (true) {
      try {
        const devices = await mobileController.getDevices();

        if (devices.length > 0) {
          console.log(`✅ Found ${devices.length} device(s)`);
          resolve(devices);
          return;
        }

        console.log('⏳ No devices found, checking again in 10 seconds...');
        await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL_MS));
      } catch (error) {
        console.error('❌ Error checking for devices:', error);
        reject(error);
        return;
      }
    }
  });

  // Race between timeout and polling
  try {
    return await Promise.race([pollingPromise, timeoutPromise]);
  } catch (error) {
    console.error('Failed to find devices:', error);
    return [];
  }
}
