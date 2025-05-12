import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, X, Check, Trash2 } from "lucide-react";
import { userService, knowledgeGraphService, nodeService } from "../../services/api";

const defaultDashboardData = {
  name: "User",
  passions: ["Creating meaningful connections", "Exploring new ideas", "Making a difference"],
  personalTraits: ["Empathetic", "Creative", "Determined"],
  paths: [
    { path: "Personal Growth", details: "Continuous learning and development" },
    { path: "Community Impact", details: "Making a positive difference" },
    { path: "Innovation", details: "Finding creative solutions" }
  ],
  dreams: [
    "Building meaningful relationships",
    "Creating lasting impact",
    "Achieving personal goals"
  ],
  reasons: ["Passion for growth", "Desire to help others", "Love for innovation"]
};

const quadrantConfig = {
  strengths: {
    title: "Who You Are (Strengths)",
    field: "personalTraits",
    type: "string",
    nodeType: "Strength"
  },
  learningStyle: {
    title: "How You Learn (Learning Style)",
    field: "passions",
    type: "string",
    nodeType: "Skill"
  },
  passions: {
    title: "What you Care About (Passions)",
    field: "dreams",
    type: "string",
    nodeType: "Goal"
  },
  goals: {
    title: "What you Strive For (Goals)",
    field: "paths",
    type: "object",
    nodeType: "Strategy"
  }
};

interface DashboardProps {
  username?: string;
}

export const Dashboard = ({ username }: DashboardProps): JSX.Element => {
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(defaultDashboardData);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editItem, setEditItem] = useState<{quadrant: string, index: number, value: string | {path: string, details: string}, isNew?: boolean} | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [editDetails, setEditDetails] = useState<string>('');

  useEffect(() => {
    const fetchOrSetSurveyData = async () => {
      setIsLoaded(false);
      
      // First try to get data from route state (from survey)
      if (location.state) {
        setData(location.state);
        localStorage.setItem('potentiallyUserData', JSON.stringify(location.state));
        
        // Save to backend if we have a username
        if (username) {
          try {
            await userService.saveSurvey(username, location.state);
          } catch (err) {
            console.error("Error saving survey data:", err);
          }
        }
        
        setIsLoaded(true);
      } else if (username) {
        // Try to fetch data from backend first
        try {
          const response = await userService.getSurvey(username);
          if (response.surveyData) {
            setData(response.surveyData);
            localStorage.setItem('potentiallyUserData', JSON.stringify(response.surveyData));
            setIsLoaded(true);
            return;
          }
        } catch (err) {
          console.error("Error fetching survey data from backend:", err);
        }
        
        // If backend fetch fails, try localStorage
        const storedData = localStorage.getItem('potentiallyUserData');
        if (storedData) {
          setData(JSON.parse(storedData));
        } else {
          // Fall back to default with username if nothing else is available
          setData({...defaultDashboardData, name: username});
        }
        setIsLoaded(true);
      } else {
        // No username, use default
        setData(defaultDashboardData);
        setIsLoaded(true);
      }
    };
    
    fetchOrSetSurveyData();
  }, [location.state, username]);

  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { duration: 0.5, staggerChildren: 0.2 }
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const updateKnowledgeGraph = async (updatedData: any) => {
    if (!username) return;
    
    try {
      // First save the survey data
      await userService.saveSurvey(username, updatedData);
      
      // Then request a knowledge graph update
      // This could potentially be a different API endpoint in a production app
      // For now, we'll just refresh the knowledge graph to reflect changes
      await knowledgeGraphService.getKnowledgeGraph(username);
    } catch (error) {
      console.error("Error updating knowledge graph:", error);
    }
  };

  const handleEdit = (quadrant: string, index: number, value: any) => {
    if (quadrant === 'goals') {
      setEditValue(value.path);
      setEditDetails(value.details);
    } else {
      setEditValue(value);
    }
    setEditItem({ quadrant, index, value });
  };

  const handleAdd = (quadrant: string) => {
    setEditValue('');
    setEditDetails('');
    setEditItem({ 
      quadrant, 
      index: -1, 
      value: quadrant === 'goals' ? { path: '', details: '' } : '',
      isNew: true 
    });
  };

  const handleDelete = async (quadrant: string, index: number) => {
    setIsUpdating(true);
    
    const field = quadrantConfig[quadrant as keyof typeof quadrantConfig].field;
    const newData = { ...data };
    newData[field] = [...data[field]];
    newData[field].splice(index, 1);
    
    setData(newData);
    
    // Save the updated data
    localStorage.setItem('potentiallyUserData', JSON.stringify(newData));
    
    if (username) {
      await updateKnowledgeGraph(newData);
    }
    
    setIsUpdating(false);
  };

  const handleSave = async () => {
    if (!editItem) return;
    
    setIsUpdating(true);
    
    const { quadrant, index, isNew } = editItem;
    const field = quadrantConfig[quadrant as keyof typeof quadrantConfig].field;
    const newData = { ...data };
    
    // Ensure the field exists as an array
    if (!newData[field]) {
      newData[field] = [];
    }
    
    // For new items, add to the array
    if (isNew) {
      if (quadrant === 'goals') {
        newData[field].push({ path: editValue, details: editDetails });
      } else {
        newData[field].push(editValue);
      }
    } 
    // For existing items, update the value
    else {
      if (quadrant === 'goals') {
        newData[field][index] = { path: editValue, details: editDetails };
      } else {
        newData[field][index] = editValue;
      }
    }
    
    setData(newData);
    setEditItem(null);
    
    // Save the updated data
    localStorage.setItem('potentiallyUserData', JSON.stringify(newData));
    
    if (username) {
      await updateKnowledgeGraph(newData);
    }
    
    setIsUpdating(false);
  };

  const handleCancel = () => {
    setEditItem(null);
  };

  const handleKnowledgeGraphClick = () => {
    navigate('/knowledge-graph');
  };

  const handleChatClick = () => {
    navigate('/chat');
  };

  const renderQuadrant = (quadrant: string, title: string, fieldKey: string, itemType: string) => {
    const items = data[fieldKey] || [];
    
    return (
      <motion.div 
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
        className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/30 relative overflow-hidden"
      >
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <div className="space-y-2 mb-4">
          {items.map((item: any, idx: number) => {
            // If this is the item being edited
            if (editItem && editItem.quadrant === quadrant && editItem.index === idx) {
              return (
                <div key={idx} className="bg-white/20 rounded-lg p-3">
                  {itemType === 'object' ? (
                    <>
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        placeholder="Enter title"
                        className="w-full mb-2 p-2 bg-white/10 rounded border border-white/30 text-white placeholder-white/50"
                        autoFocus
                      />
                      <textarea
                        value={editDetails}
                        onChange={(e) => setEditDetails(e.target.value)}
                        placeholder="Enter details"
                        className="w-full p-2 bg-white/10 rounded border border-white/30 text-white placeholder-white/50"
                        rows={2}
                      />
                    </>
                  ) : (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full p-2 bg-white/10 rounded border border-white/30 text-white placeholder-white/50"
                      autoFocus
                    />
                  )}
                  
                  <div className="flex justify-end mt-2 space-x-2">
                    <button 
                      onClick={handleCancel}
                      className="p-1 rounded-full bg-white/20 hover:bg-white/30"
                      disabled={isUpdating}
                    >
                      <X size={16} />
                    </button>
                    <button 
                      onClick={handleSave}
                      className="p-1 rounded-full bg-white/20 hover:bg-white/30"
                      disabled={isUpdating || !editValue.trim()}
                    >
                      <Check size={16} />
                    </button>
                  </div>
                </div>
              );
            }
            
            // Regular display
            return (
              <div key={idx} className="bg-white/10 rounded-lg px-4 py-2 hover:bg-white/20 transition-colors group relative">
                {itemType === 'object' ? (
                  <>
                    <div className="font-medium">{item.path}</div>
                    {item.details && (
                      <div className="text-sm text-blue-200 mt-1">{item.details}</div>
                    )}
                  </>
                ) : (
                  <div>{item}</div>
                )}
                
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                  <button 
                    onClick={() => handleEdit(quadrant, idx, item)}
                    className="p-1 rounded-full bg-white/20 hover:bg-white/30"
                    disabled={isUpdating || !!editItem}
                  >
                    <Pencil size={14} />
                  </button>
                  <button 
                    onClick={() => handleDelete(quadrant, idx)}
                    className="p-1 rounded-full bg-white/20 hover:bg-white/30"
                    disabled={isUpdating || !!editItem}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
          
          {/* Add new item form */}
          {editItem && editItem.quadrant === quadrant && editItem.isNew && (
            <div className="bg-white/20 rounded-lg p-3">
              {itemType === 'object' ? (
                <>
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder="Enter title"
                    className="w-full mb-2 p-2 bg-white/10 rounded border border-white/30 text-white placeholder-white/50"
                    autoFocus
                  />
                  <textarea
                    value={editDetails}
                    onChange={(e) => setEditDetails(e.target.value)}
                    placeholder="Enter details"
                    className="w-full p-2 bg-white/10 rounded border border-white/30 text-white placeholder-white/50"
                    rows={2}
                  />
                </>
              ) : (
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder="Enter new item"
                  className="w-full p-2 bg-white/10 rounded border border-white/30 text-white placeholder-white/50"
                  autoFocus
                />
              )}
              
              <div className="flex justify-end mt-2 space-x-2">
                <button 
                  onClick={handleCancel}
                  className="p-1 rounded-full bg-white/20 hover:bg-white/30"
                  disabled={isUpdating}
                >
                  <X size={16} />
                </button>
                <button 
                  onClick={handleSave}
                  className="p-1 rounded-full bg-white/20 hover:bg-white/30"
                  disabled={isUpdating || !editValue.trim()}
                >
                  <Check size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Add button */}
        {!editItem && (
          <button 
            onClick={() => handleAdd(quadrant)}
            className="w-full flex items-center justify-center p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            disabled={isUpdating}
          >
            <Plus size={16} className="mr-1" />
            <span>Add {title.split('(')[0].trim()}</span>
          </button>
        )}
      </motion.div>
    );
  };

  if (!isLoaded) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-gradient-to-b from-purple-800 to-blue-700 p-8 text-white relative"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div variants={itemVariants} className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4">
            Welcome to your map, {data.name}
          </h1>
          <p className="text-xl text-blue-200">
            Click on any card to add, edit, or delete entries.
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {/* Top Left Quadrant */}
            {renderQuadrant('strengths', quadrantConfig.strengths.title, quadrantConfig.strengths.field, quadrantConfig.strengths.type)}
            
            {/* Top Right Quadrant */}
            {renderQuadrant('learningStyle', quadrantConfig.learningStyle.title, quadrantConfig.learningStyle.field, quadrantConfig.learningStyle.type)}
            
            {/* Bottom Left Quadrant */}
            {renderQuadrant('passions', quadrantConfig.passions.title, quadrantConfig.passions.field, quadrantConfig.passions.type)}
            
            {/* Bottom Right Quadrant */}
            {renderQuadrant('goals', quadrantConfig.goals.title, quadrantConfig.goals.field, quadrantConfig.goals.type)}
          </div>

          <motion.div 
            variants={itemVariants}
            className="flex justify-center space-x-6 mt-8"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleKnowledgeGraphClick}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm text-white font-medium transition-colors"
              disabled={isUpdating}
            >
              View Knowledge Graph
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleChatClick}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm text-white font-medium transition-colors"
              disabled={isUpdating}
            >
              Chat with Assistant
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;