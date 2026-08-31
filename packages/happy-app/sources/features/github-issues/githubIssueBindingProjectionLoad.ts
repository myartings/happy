export async function loadGithubIssueBindingProjectionRecords<Binding, History>(
    api: {
        list(): Promise<Binding[]>;
        history(): Promise<History[]>;
    },
): Promise<{ bindings: Binding[]; history: History[] }> {
    const bindings = await api.list();
    try {
        return { bindings, history: await api.history() };
    } catch {
        // Transfer history is optional presentation data. A capacity or network
        // failure must not hide authoritative current bindings.
        return { bindings, history: [] };
    }
}
