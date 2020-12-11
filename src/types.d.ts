declare namespace Store {
  interface Shortcut {
    name: string;
    selected: boolean;
    escapedName?: string;
    image?: string;
    data?: Uint8Array;
    size?: number;
  }

  interface Snippet {
    name: string;
    isClipboard: boolean;
    numberOfActions: number;
    uuids: {
      groups: string[];
      vars: string[];
    };
    actions: object[];
  }

  interface Insert {
    id: number;
    name: string;
    isClipboard: boolean;
    position: number;
  }

  interface ProcessResult {
    warnings: string[];
    nItems: number;
    shortcuts: {
      name: string;
      actionsToRemove: number[];
      uuids: {
        groups: string[];
        vars: string[];
      };
      inserts: Insert[];
      snippets: Snippet;
    }[];
  }

  interface Globals {
    functionDefinition: string;
    noSnippetName: string;
  }

  interface Preferences {
    language: string;
    autoOpenApp: boolean;
    excludeAllCPAComments: boolean;
    cleanUp: 0 | 1 | 2;
    commentMarker: string;
    includeShortcutImages: boolean;
    codeZoom: number;
    switchCaption: boolean;
    ignoreVersion: false | string;
    skipFoundInsertsOnNoInsert: boolean;
    autoOverwriteSnippets: boolean;
    autoLoadShortcuts: string[];
    autoAnalyseShortcuts: boolean;
    autoAcceptInserts: boolean;
  }
  interface AppSettings {
    "Shortcut Name": string;
    Version: string;
    "RoutineHub ID": number;
    Storage: string;
    "Preferences Version": number;
    "Default Preferences": Preferences;
    "iOS Version": string;
    Preferences: Preferences;
    componentToDisplay: string;
    availableLanguages: { [key: string]: string };
    "First Run": boolean;
  }

  interface UpdateData {
    version: string;
    url: string;
    notes: string;
    release: Date;
  }
  type UpdateAvailable = false | UpdateData;

  interface ShortcutToImport {
    name: string;
    url: string;
    image: string;
    done: boolean;
  }

  interface ICloudUrl {
    name: string;
    url: string;
    date: Date;
  }
  interface ICloudShortcut extends ICloudUrl {
    image: string;
  }
}

declare namespace ButtonBar {
  interface Button {
    text: string;
    class: string;
    icon?: string | { component: string };
    iconOptions?: object;
    disabled?: boolean;
    click?: Function;
  }
}

declare namespace MenuList {
  interface MenuItem {
    title: string;
    description: string;
    icon: string | { component: string };
    iconColor?: string;
    iconOptions?: object;
    click: () => void;
  }
}

declare namespace Preferences {
  interface LangItem {
    title: string;
    description: string;
    /** Used for an enum */
    values?: { [key: string]: string };
    /** Used for an array */
    valueTitle?: string;
    /** Used for an array */
    valueTitleEmptySelection?: string;
  }

  interface PrefSubtype<T, K> {
    value: T;
    type: K;
    constraints: K extends "number"
      ? number[] | { min: number; max: number; step: number }
      : K extends "list"
      ? string[]
      : undefined;
  }

  interface PrefWithLangBase {
    key: string;
    lang: LangItem;
    default: string;
  }

  type PrefWithLang = PrefWithLangBase &
    (
      | PrefSubtype<number, "number">
      | PrefSubtype<string, "string">
      | PrefSubtype<boolean, "boolean">
      | PrefSubtype<string[], "array">
      | PrefSubtype<string, "list">
    );
}
