// Type definitions for vis-network
declare module 'vis-network' {
  export class Network {
    constructor(
      container: HTMLElement, 
      data: { nodes: any; edges: any }, 
      options?: any
    );
    
    on(event: string, callback: (params?: any) => void): void;
    off(event: string, callback: (params?: any) => void): void;
    destroy(): void;
    fit(options?: { animation: boolean }): void;
    setData(data: { nodes: any; edges: any }): void;
    setOptions(options: any): void;
    selectNodes(nodeIds: string[], highlightEdges?: boolean): void;
    getSelectedNodes(): string[];
    getConnectedNodes(nodeId: string): string[];
  }

  export class DataSet<T> {
    constructor(data?: T[], options?: any);
    
    add(data: T | T[], senderId?: string): string | string[];
    update(data: T | T[], senderId?: string): string | string[];
    remove(id: string | string[], senderId?: string): string | string[];
    get(id: string | string[]): T | T[];
    getIds(options?: { filter: (item: T) => boolean }): string[];
    forEach(callback: (item: T, id: string) => void): void;
  }
}