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
              <div className="flex items-start mb-
