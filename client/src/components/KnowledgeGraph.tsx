import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { nodeService, type Node } from '../services/api';
import { Plus, Edit, Trash2, Save, X, Loader } from 'lucide-react';

interface KnowledgeGraphProps {
  username: string;
}

const KnowledgeGraph = ({ username }: KnowledgeGraphProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedNodeId = searchParams.get('nodeId');

  const [nodes, setNodes] = useState<Node[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingNode, setEditingNode] = useState<Partial<Node>>({
    title: '',
    content: '',
    position: { x: 0, y: 0 }
  });

  useEffect(() => {
    const fetchNodes = async () => {
      try {
        setIsLoading(true);
        const response = await nodeService.getNodes(username);
        setNodes(response.nodes || []);
        
        // If a node ID is in the URL, select it for editing
        if (selectedNodeId) {
          const node = response.nodes.find(n => n.id === selectedNodeId);
          if (node) {
            setEditingNode(node);
            setIsEditing(true);
          }
        }
      } catch (err) {
        console.error('Error fetching nodes:', err);
        setError('Failed to load knowledge graph nodes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNodes();
  }, [username, selectedNodeId]);

  const handleCreateNode = () => {
    setEditingNode({
      title: '',
      content: '',
      position: { x: Math.random() * 500, y: Math.random() * 500 } // Random position for now
    });
    setIsEditing(true);
    
    // Clear node from URL
    searchParams.delete('nodeId');
    setSearchParams(searchParams);
  };

  const handleEditNode = (node: Node) => {
    setEditingNode(node);
    setIsEditing(true);
    
    // Set node ID in URL
    searchParams.set('nodeId', node.id);
    setSearchParams(searchParams);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingNode({
      title: '',
      content: '',
      position: { x: 0, y: 0 }
    });
    
    // Clear node from URL
    searchParams.delete('nodeId');
    setSearchParams(searchParams);
  };

  const handleSaveNode = async () => {
    if (!editingNode.title?.trim()) {
      setError('Node title is required');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      if ('id' in editingNode && editingNode.id) {
        // Update existing node
        const response = await nodeService.updateNode(
          editingNode.id,
          {
            title: editingNode.title,
            content: editingNode.content,
            position: editingNode.position
          }
        );
        
        if (response.node) {
          setNodes(prevNodes => 
            prevNodes.map(node => 
              node.id === response.node.id ? response.node : node
            )
          );
        }
      } else {
        // Create new node
        const response = await nodeService.createNode(
          username,
          {
            title: editingNode.title as string,
            content: editingNode.content as string,
            position: editingNode.position as { x: number, y: number }
          }
        );
        
        if (response.node) {
          setNodes(prevNodes => [...prevNodes, response.node]);
        }
      }
      
      // Reset form
      setIsEditing(false);
      setEditingNode({
        title: '',
        content: '',
        position: { x: 0, y: 0 }
      });
      
      // Clear node from URL
      searchParams.delete('nodeId');
      setSearchParams(searchParams);
    } catch (err) {
      console.error('Error saving node:', err);
      setError('Failed to save node');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNode = async (nodeId: string) => {
    if (!window.confirm('Are you sure you want to delete this node?')) {
      return;
    }
    
    try {
      setIsLoading(true);
      await nodeService.deleteNode(nodeId);
      
      setNodes(prevNodes => prevNodes.filter(node => node.id !== nodeId));
      
      // If we were editing this node, reset the form
      if (editingNode.id === nodeId) {
        setIsEditing(false);
        setEditingNode({
          title: '',
          content: '',
          position: { x: 0, y: 0 }
        });
        
        // Clear node from URL
        searchParams.delete('nodeId');
        setSearchParams(searchParams);
      }
    } catch (err) {
      console.error('Error deleting node:', err);
      setError('Failed to delete node');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Knowledge Graph</h1>
        <button
          onClick={handleCreateNode}
          className="btn btn-primary flex items-center"
          disabled={isLoading}
        >
          <Plus className="h-5 w-5 mr-1" />
          Create Node
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Nodes list */}
        <div className="space-y-4">
          {isLoading && nodes.length === 0 ? (
            <div className="flex justify-center py-12">
              <Loader className="h-8 w-8 text-primary-500 animate-spin" />
            </div>
          ) : nodes.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <h2 className="text-lg font-medium mb-2">No Nodes Yet</h2>
              <p className="text-gray-600 mb-4">
                Your knowledge graph is empty. Create your first node to get started!
              </p>
              <button
                onClick={handleCreateNode}
                className="btn btn-primary"
              >
                Create First Node
              </button>
            </div>
          ) : (
            nodes.map((node) => (
              <div
                key={node.id}
                className={`card ${
                  node.id === editingNode.id ? 'border-2 border-primary-500' : ''
                }`}
              >
                <h3 className="font-medium mb-1 truncate">{node.title}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{node.content}</p>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => handleEditNode(node)}
                    className="p-1 text-primary-700 hover:bg-primary-50 rounded"
                    title="Edit"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteNode(node.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                    title="Delete"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Edit form */}
        {isEditing && (
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">
                {'id' in editingNode ? 'Edit Node' : 'Create Node'}
              </h2>
              <button
                onClick={handleCancelEdit}
                className="p-1 text-gray-500 hover:bg-gray-100 rounded"
                title="Cancel"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={editingNode.title || ''}
                  onChange={(e) => setEditingNode({ ...editingNode, title: e.target.value })}
                  className="input"
                  placeholder="Node title"
                />
              </div>
              
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  id="content"
                  value={editingNode.content || ''}
                  onChange={(e) => setEditingNode({ ...editingNode, content: e.target.value })}
                  rows={6}
                  className="input"
                  placeholder="Node content..."
                />
              </div>
              
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSaveNode}
                  disabled={isLoading}
                  className="btn btn-primary flex items-center"
                >
                  {isLoading ? (
                    <Loader className="h-5 w-5 mr-1 animate-spin" />
                  ) : (
                    <Save className="h-5 w-5 mr-1" />
                  )}
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeGraph;
