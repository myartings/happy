import { describe, it, expect } from 'vitest'
import { ensureLocalProxyBypass, removeUnsupportedSocksProxyFallback } from './proxyBypass'

describe('ensureLocalProxyBypass', () => {
    it('sets NO_PROXY and no_proxy when env is empty', () => {
        const env: Record<string, string | undefined> = {}
        ensureLocalProxyBypass(env)
        expect(env.NO_PROXY).toBe('127.0.0.1,localhost,::1')
        expect(env.no_proxy).toBe('127.0.0.1,localhost,::1')
    })

    it('appends to existing NO_PROXY that has no local entries', () => {
        const env: Record<string, string | undefined> = { NO_PROXY: 'internal.corp' }
        ensureLocalProxyBypass(env)
        expect(env.NO_PROXY).toBe('internal.corp,127.0.0.1,localhost,::1')
        expect(env.no_proxy).toBe('internal.corp,127.0.0.1,localhost,::1')
    })

    it('is idempotent when all loopback entries already present', () => {
        const env: Record<string, string | undefined> = { NO_PROXY: '127.0.0.1,localhost,::1' }
        ensureLocalProxyBypass(env)
        expect(env.NO_PROXY).toBe('127.0.0.1,localhost,::1')
    })

    it('reads no_proxy (lowercase) when NO_PROXY is absent', () => {
        const env: Record<string, string | undefined> = { no_proxy: 'foo.bar' }
        ensureLocalProxyBypass(env)
        expect(env.NO_PROXY).toBe('foo.bar,127.0.0.1,localhost,::1')
        expect(env.no_proxy).toBe('foo.bar,127.0.0.1,localhost,::1')
    })

    it('prefers NO_PROXY over no_proxy when both exist', () => {
        const env: Record<string, string | undefined> = { NO_PROXY: 'a.com', no_proxy: 'b.com' }
        ensureLocalProxyBypass(env)
        expect(env.NO_PROXY).toBe('a.com,127.0.0.1,localhost,::1')
        expect(env.no_proxy).toBe('a.com,127.0.0.1,localhost,::1')
    })

    it('only appends missing entries when some loopback addresses already present', () => {
        const env: Record<string, string | undefined> = { NO_PROXY: '127.0.0.1' }
        ensureLocalProxyBypass(env)
        expect(env.NO_PROXY).toBe('127.0.0.1,localhost,::1')
    })

    it('handles whitespace in existing entries', () => {
        const env: Record<string, string | undefined> = { NO_PROXY: ' 127.0.0.1 , localhost , ::1 ' }
        ensureLocalProxyBypass(env)
        expect(env.NO_PROXY).toBe(' 127.0.0.1 , localhost , ::1 ')
    })

    it('appends only ::1 when IPv4 loopback entries already present', () => {
        const env: Record<string, string | undefined> = { NO_PROXY: '127.0.0.1,localhost' }
        ensureLocalProxyBypass(env)
        expect(env.NO_PROXY).toBe('127.0.0.1,localhost,::1')
    })

    it('respects explicitly empty NO_PROXY via nullish coalescing', () => {
        const env: Record<string, string | undefined> = { NO_PROXY: '' }
        ensureLocalProxyBypass(env)
        expect(env.NO_PROXY).toBe('127.0.0.1,localhost,::1')
    })
})

describe('removeUnsupportedSocksProxyFallback', () => {
    it('removes SOCKS fallback and HTTP proxy values', () => {
        const env: Record<string, string | undefined> = {
            ALL_PROXY: 'socks5://127.0.0.1:7890',
            all_proxy: 'socks5h://127.0.0.1:7890',
            HTTP_PROXY: 'http://127.0.0.1:7890',
            HTTPS_PROXY: 'http://127.0.0.1:7890',
            http_proxy: 'http://127.0.0.1:7890',
            https_proxy: 'http://127.0.0.1:7890',
        }

        removeUnsupportedSocksProxyFallback(env)

        expect(env.ALL_PROXY).toBeUndefined()
        expect(env.all_proxy).toBeUndefined()
        expect(env.HTTP_PROXY).toBeUndefined()
        expect(env.HTTPS_PROXY).toBeUndefined()
        expect(env.http_proxy).toBeUndefined()
        expect(env.https_proxy).toBeUndefined()
    })

    it('keeps HTTP ALL_PROXY values', () => {
        const env: Record<string, string | undefined> = {
            ALL_PROXY: 'http://127.0.0.1:7890',
            all_proxy: 'https://proxy.example.com:443',
            HTTPS_PROXY: 'http://127.0.0.1:7890',
        }

        removeUnsupportedSocksProxyFallback(env)

        expect(env.ALL_PROXY).toBe('http://127.0.0.1:7890')
        expect(env.all_proxy).toBe('https://proxy.example.com:443')
        expect(env.HTTPS_PROXY).toBe('http://127.0.0.1:7890')
    })
})
