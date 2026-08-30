export interface Command {
    id: string;
    title: string;
    subtitle?: string;
    icon?: string;
    shortcut?: string;
    category?: string;
    /** Indexed by search but omitted from the bounded no-query surface. */
    searchOnly?: boolean;
    action: () => void | Promise<void>;
}

export interface CommandCategory {
    id: string;
    title: string;
    commands: Command[];
}
