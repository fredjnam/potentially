// Types for API responses
export interface User {
  name: string;
}

export interface Node {
  id: string;
  title: string;
  content: string;
  position: {
    x: number;
    y: number;
  };
  createdAt: string;
}

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: string;
}

export interface KnowledgeGraphNode {
  id: string;
  label: string;
  properties: {
    name: string;
    description?: string;
    source?: string;
    confidence?: number;
    relevance?: string;
    [key: string]: any;
  };
}

export interface KnowledgeGraphRelationship {
  from: string;
  to: string;
  type: string;
  properties: {
    description?: string;
    strength?: number;
    [key: string]: any;
  };
}

export interface VisGraphNode {
  id: string;
  label: string;
  title: string;
  group: string;
}

export interface VisGraphEdge {
  from: string;
  to: string;
  label: string;
  title: string;
}

// User-related API calls
export const userService = {
  createUser: async (name: string): Promise<{ user: User }> => {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return response.json();
  },

  saveSurvey: async (name: string, surveyData: any): Promise<{ success: boolean }> => {
    const response = await fetch(`/api/users/${name}/survey`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(surveyData),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return response.json();
  },
  
  getSurvey: async (name: string): Promise<{ surveyData: any }> => {
    const response = await fetch(`/api/users/${name}/survey`);

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return response.json();
  },
};

// Knowledge Graph Node API calls
export const nodeService = {
  getNodes: async (username: string): Promise<{ nodes: Node[] }> => {
    const response = await fetch(`/api/users/${username}/nodes`);

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return response.json();
  },

  createNode: async (
    username: string,
    nodeData: { title: string; content: string; position: { x: number; y: number } }
  ): Promise<{ node: Node }> => {
    const response = await fetch(`/api/users/${username}/nodes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nodeData),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return response.json();
  },

  updateNode: async (
    nodeId: string,
    updates: Partial<Node>
  ): Promise<{ node: Node }> => {
    const response = await fetch(`/api/nodes/${nodeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return response.json();
  },

  deleteNode: async (nodeId: string): Promise<{ success: boolean }> => {
    const response = await fetch(`/api/nodes/${nodeId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return response.json();
  },
};

// Chat API calls
export const chatService = {
  getMessages: async (username: string): Promise<{ messages: Message[] }> => {
    const response = await fetch(`/api/users/${username}/messages`);

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return response.json();
  },

  sendMessage: async (
    username: string,
    content: string
  ): Promise<{ message: Message }> => {
    const response = await fetch(`/api/users/${username}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return response.json();
  },

  chatWithAI: async (username: string, messages: Array<{ role: string; content: string }>, apiKey?: string) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (apiKey) {
      headers['x-openai-key'] = apiKey;
    }

    const response = await fetch(`/api/users/${username}/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: 'gpt-4',
        messages,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return response.json();
  },
};

// Knowledge Graph API calls
export const knowledgeGraphService = {
  getKnowledgeGraph: async (username: string, format: 'default' | 'vis' = 'default') => {
    const response = await fetch(`/api/users/${username}/knowledge-graph?format=${format}`);

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return response.json();
  },
};
