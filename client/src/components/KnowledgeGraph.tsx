import { useState, useEffect, useRef } from 'react';
import { knowledgeGraphService } from '../services/api';
import { Loader, Network } from 'lucide-react';
import * as vis from 'vis-network';

interface KnowledgeGraphProps {
  username: string;
}

const KnowledgeGraph = ({ username }: KnowledgeGraphProps) => {
  const [knowledgeGraph, setKnowledgeGraph] = useState<{ nodes: any[], edges: any[] }>({ nodes: [], edges: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const networkContainer = useRef<HTMLDivElement>(null);
  const networkInstance = useRef<vis.Network | null>(null);

  // Function to initialize or update the network visualization
  const initializeNetwork = (graphData: { nodes: any[], edges: any[] }) => {
    if (!networkContainer.current) return;
    
    // Dispose of the previous network if it exists
    if (networkInstance.current) {
      networkInstance.current.destroy();
      networkInstance.current = null;
    }
    
    // Create new network
    const options = {
      nodes: {
        shape: 'dot',
        size: 16,
        font: {
          color: '#ffffff',
          face: 'Roboto, system-ui, sans-serif',
          size: 14
        },
        borderWidth: 2,
        shadow: true
      },
      edges: {
        width: 2,
        shadow: true,
        color: {
          color: 'rgba(255, 255, 255, 0.5)',
          highlight: '#ffffff'
        },
        font: {
          color: '#ffffff',
          size: 12,
          align: 'middle'
        }
      },
      physics: {
        enabled: true,
        stabilization: {
          iterations: 100
        },
        barnesHut: {
          gravitationalConstant: -3000,
          springConstant: 0.04,
          springLength: 120
        }
      },
      interaction: {
        hover: true,
        navigationButtons: true,
        keyboard: {
          enabled: true,
          bindToWindow: false
        }
      },
      groups: {
        Topic: { color: { background: '#6366f1', border: '#4f46e5' } },
        Skill: { color: { background: '#8b5cf6', border: '#7c3aed' } },
        Goal: { color: { background: '#ec4899', border: '#d946ef' } },
        Challenge: { color: { background: '#f43f5e', border: '#e11d48' } },
        Resource: { color: { background: '#06b6d4', border: '#0891b2' } },
        Strategy: { color: { background: '#10b981', border: '#059669' } },
        KnowledgeGraph: { color: { background: '#334155', border: '#1e293b' }, hidden: true },
        Node: { color: { background: '#38bdf8', border: '#0284c7' } }
      }
    };
    
    // Create the network
    networkInstance.current = new vis.Network(
      networkContainer.current,
      { nodes: graphData.nodes, edges: graphData.edges },
      options
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch knowledge graph data
        const graphResponse = await knowledgeGraphService.getKnowledgeGraph(username, 'vis');
        setKnowledgeGraph(graphResponse || { nodes: [], edges: [] });
        
      } catch (err) {
        console.error('Error fetching graph data:', err);
        setError('Failed to load knowledge graph');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    
    // Set up a refresh interval for the knowledge graph (every 30 seconds)
    const refreshInterval = setInterval(() => {
      fetchData();
    }, 30000);
    
    return () => {
      clearInterval(refreshInterval);
    };
  }, [username]);
  
  // Initialize visualization when knowledge graph data changes
  useEffect(() => {
    if (!isLoading && knowledgeGraph.nodes.length > 0) {
      initializeNetwork(knowledgeGraph);
    }
  }, [knowledgeGraph, isLoading]);

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Knowledge Graph</h1>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-400/30 text-red-300 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Full-width graph visualization */}
      <div 
        ref={networkContainer} 
        className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg w-full" 
        style={{ height: '700px' }}
      >
        {isLoading && (
          <div className="flex justify-center items-center h-full">
            <Loader className="h-8 w-8 text-white animate-spin" />
          </div>
        )}
        {(!isLoading && knowledgeGraph.nodes.length === 0) && (
          <div className="flex flex-col justify-center items-center h-full">
            <Network className="h-12 w-12 text-white/40 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Knowledge Graph Yet</h3>
            <p className="text-white/70 mb-4 text-center max-w-sm">
              Start chatting to build your knowledge graph automatically.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeGraph;
