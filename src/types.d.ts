declare namespace Store {
  interface Shortcut {
    name: string,
    selected: boolean,
    escapedName?: string,
    image?: string,
    data?: Uint8Array,
    size?: number
  }

  interface Snippet {
    name: string,
    isClipboard: boolean,
    newShortcut: string,
    numberOfActions: number,
    uuids: {
      groups: string[],
      vars: string[]
    }
    actions: string
  }

  interface Insert {
    id: number,
    name: string,
    isClipboard: boolean,
    position: number
  }

  interface ProcessResult {
    warnings: string[],
    nItems: number,
    shortcuts: {
      name: string,
      actionsToRemove: number[],
      uuids: {
        groups: string[],
        vars: string[]
      },
      inserts: Insert[],
      snippets: Snippet
    }[]
  }

  interface Globals {
    functionDefinition: string,
    noSnippetName: string
  }
}
