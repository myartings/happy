import { describe, expect, it } from 'vitest'

import { daemonSessionExecution } from './sessionProcessIsolation'

describe('daemonSessionExecution', () => {
  it('requests a transient scope only for a Linux daemon invoked by systemd', () => {
    expect(daemonSessionExecution('linux', { INVOCATION_ID: 'invocation-1' }))
      .toEqual({ systemdScope: true })
    expect(daemonSessionExecution('linux', {})).toEqual({})
    expect(daemonSessionExecution('darwin', { INVOCATION_ID: 'invocation-1' }))
      .toEqual({})
    expect(daemonSessionExecution('win32', { INVOCATION_ID: 'invocation-1' }))
      .toEqual({})
  })
})
