import type { SpawnHappyCLIExecution } from '@/utils/spawnHappyCLI'

export function daemonSessionExecution(
  platform: NodeJS.Platform = process.platform,
  environment: NodeJS.ProcessEnv = process.env,
): SpawnHappyCLIExecution {
  if (platform === 'linux' && environment.INVOCATION_ID) {
    return { systemdScope: true }
  }
  return {}
}
