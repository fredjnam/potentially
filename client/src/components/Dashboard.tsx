// client/src/components/Dashboard.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { nodeService, type Node } from '../services/api';
import { Network, MessageSquare, Loader } from 'lucide-react';

interface DashboardProps {
  username: string;
}

const Dashboard = ({ username }: DashboardProps) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNodes = async () => {
      try {
        setIsLoading(true);
        const response = await nodeService.getNodes(username);
        setNodes(response.nodes || []);
      } catch (err) {
        console.error('Error fetching nodes:', err);
        setError('Failed to load knowledge graph nodes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNodes();
  }, [username]);

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Welcome, {username}!</h1>
        <p className="text-gray-600">
          Manage your knowledge graph and chat with AI assistance
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader className="h-8 w-8 text-primary-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Knowledge Graph Card */}
            <div className="card">
              <div className="flex items-start mb-4">
                <div className="bg-primary-100 p-2 rounded-full mr-3">
                  <Network className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-lg font-medium">Knowledge Graph</h2>
                  <p className="text-gray-600 text-sm">
                    {nodes.length === 0
                      ? "You haven't created any nodes yet."
                      : `You have ${nodes.length} node${nodes.length === 1 ? '' : 's'} in your knowledge graph.`}
                  </p>
                </div>
              </div>
              <Link
                to="/knowledge-graph"
                className="btn btn-primary block text-center"
              >
                {nodes.length === 0 ? 'Create Your First Node' : 'View Knowledge Graph'}
              </Link>
            </div>

            {/* Chat Card */}
            <div className="card">
              <div className="flex items-start mb-4">
                <div className="bg-primary-100 p-2 rounded-full mr-3">
                  <MessageSquare className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-lg font-medium">AI Chat Assistant</h2>
                  <p className="text-gray-600 text-sm">
                    Chat with your AI assistant to help build and navigate your knowledge graph.
                  </p>
                </div>
              </div>
              <Link
                to="/chat"
                className="btn btn-primary block text-center"
              >
                Start Chatting
              </Link>
            </div>
          </div>

          {/* Recent Nodes */}
          {nodes.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Recent Nodes</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {nodes.slice(0, 6).map((node) => (
                  <div key={node.id} className="card hover:border-primary-300 border-2 border-transparent">
                    <h3 className="font-medium mb-2 truncate">{node.title}</h3>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-3">{node.content}</p>
                    <div className="flex justify-end">
                      <Link 
                        to={`/knowledge-graph?nodeId=${node.id}`}
                        className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
