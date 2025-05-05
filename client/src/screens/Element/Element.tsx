import React, { useState, KeyboardEvent, useEffect } from "react";
import { Card, CardContent } from "../../components/ui/card";
import Typewriter from 'typewriter-effect';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from "react-router-dom";
import { userService } from "../../services/api";

export const Element = (): JSX.Element => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [showFirstSentence, setShowFirstSentence] = useState(false);
  const [showSecondSentence, setShowSecondSentence] = useState(false);
  const [showPersonalitySection, setShowPersonalitySection] = useState(false);
  const [nameConfirmed, setNameConfirmed] = useState(false);
  const [selectedTraits, setSelectedTraits] = useState(['', '', '']);
  const [customTraits, setCustomTraits] = useState(['', '', '']);
  const [showTraitInputs, setShowTraitInputs] = useState([false, false, false]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);
  const [activityDetails, setActivityDetails] = useState<Record<string, string>>({});
  const [hobbyDetails, setHobbyDetails] = useState<Record<string, string>>({});
  const [isOpen, setIsOpen] = useState<number | null>(null);
  const [showNextButton, setShowNextButton] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [customClassName, setCustomClassName] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [showCustomReason, setShowCustomReason] = useState(false);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [showSubjectSection, setShowSubjectSection] = useState(false);
  const [selectedPassions, setSelectedPassions] = useState<string[]>([]);
  const [selectedPersonalTraits, setSelectedPersonalTraits] = useState<string[]>([]);
  const [customPassion, setCustomPassion] = useState('');
  const [customTrait, setCustomTrait] = useState('');
  const [showCustomPassion, setShowCustomPassion] = useState(false);
  const [showCustomTrait, setShowCustomTrait] = useState(false);
  const [selectedPaths, setSelectedPaths] = useState<string[]>([]);
  const [pathDetails, setPathDetails] = useState<Record<string, string>>({});
  const [selectedDreams, setSelectedDreams] = useState<string[]>([]);
  const [customDream, setCustomDream] = useState('');
  const [showCustomDream, setShowCustomDream] = useState(false);

  const grades = ['9th Grader', '10th Grader', '11th Grader', '12th Grader'];
  
  const firstTraits = ['Curious', 'Empathetic', 'Determined', 'Creative'];
  const secondTraits = ['Analytical', 'Funny', 'Outgoing', 'Thoughtful'];
  const thirdTraits = ['Resilient', 'Imaginative', 'Quiet but strong', 'Passionate'];

  const classes = [
    'Science',
    'Math',
    'English/Language Arts',
    'History/Social Studies',
    'Art/Music',
    'Physical Education',
    'Other'
  ];

  const activities = [
    {
      id: 'sports',
      label: 'Sports or athletic activities',
      prompt: 'What kind of sports or athletic activities?'
    },
    {
      id: 'performing-arts',
      label: 'Performing arts',
      prompt: 'Which performing arts?'
    },
    {
      id: 'academic-clubs',
      label: 'Academic clubs or competitions',
      prompt: 'Which academic clubs or competitions?'
    },
    {
      id: 'creative',
      label: 'Creative pursuits',
      prompt: 'What kind of creative pursuits?'
    },
    {
      id: 'community',
      label: 'Community service or leadership',
      prompt: 'Describe your involvement.'
    },
    {
      id: 'tech',
      label: 'Technology or STEM activities',
      prompt: 'What kind of tech or STEM activities?'
    },
    {
      id: 'other-activity',
      label: 'Other',
      prompt: 'Please specify.'
    }
  ];

  const hobbies = [
    {
      id: 'reading',
      label: 'Reading or writing',
      prompt: 'What do you enjoy reading or writing?'
    },
    {
      id: 'art',
      label: 'Creating art',
      prompt: 'What kind of art do you create?'
    },
    {
      id: 'media',
      label: 'Watching media',
      prompt: 'What kind of media or shows do you watch?'
    },
    {
      id: 'social',
      label: 'Socializing',
      prompt: 'How do you like to spend time with others?'
    },
    {
      id: 'outdoor',
      label: 'Outdoor activities',
      prompt: 'What kind of outdoor activities?'
    },
    {
      id: 'games',
      label: 'Playing games',
      prompt: 'What kind of games do you enjoy?'
    },
    {
      id: 'learning',
      label: 'Learning new skills',
      prompt: 'What are you learning right now?'
    },
    {
      id: 'online',
      label: 'Online activities',
      prompt: 'What do you do online?'
    },
    {
      id: 'other-hobby',
      label: 'Other',
      prompt: 'Please specify.'
    }
  ];

  const passions = [
    'Learning and discovering new things',
    'Creating and building',
    'Performing and expressing myself',
    'Connecting with people and cultures',
    'Solving problems and overcoming challenges',
    'Reflecting and understanding deeply',
    'Other'
  ];

  const personalTraits = [
    'Shows curiosity and openness',
    'Demonstrates determination and resilience',
    'Values connection and empathy',
    'Prioritizes authenticity and self-expression',
    'Embraces growth and learning',
    'Appreciates independence and self-direction',
    'Is still exploring and discovering my identity',
    'Other'
  ];

  const postHighSchoolPaths = [
    {
      id: 'college',
      label: 'Attending college or university',
      prompt: 'What kind of school or program?'
    },
    {
      id: 'vocational',
      label: 'Pursuing vocational or technical training',
      prompt: 'What area or skill?'
    },
    {
      id: 'work',
      label: 'Starting work or an apprenticeship',
      prompt: 'What kind of work or trade?'
    },
    {
      id: 'gap-year',
      label: 'Taking a gap year or traveling',
      prompt: 'What would you like to explore or experience?'
    },
    {
      id: 'military',
      label: 'Joining the military or service program',
      prompt: 'Which program are you considering?'
    },
    {
      id: 'business',
      label: 'Starting my own business or project',
      prompt: 'What kind of business or project?'
    },
    {
      id: 'exploring',
      label: 'Still exploring my options',
      prompt: 'What ideas are you exploring?'
    },
    {
      id: 'other-path',
      label: 'Other',
      prompt: 'Please describe.'
    }
  ];

  const pathReasons = [
    'I want to explore my interests and passions',
    'I hope to build specific skills for a career',
    'I value gaining independence and life experience',
    'I\'m eager to make a difference in my community',
    'I want to challenge myself in new environments',
    'I need financial stability and opportunities',
    'Other'
  ];

  const dreams = [
    'Becoming a leader in my field or community',
    'Creating something innovative or meaningful',
    'Helping others and making positive change',
    'Exploring different cultures and perspectives',
    'Achieving financial success and stability',
    'Finding work that brings me fulfillment',
    'Other'
  ];

  const reasonsByClass = {
    'Science': [
      'Love conducting experiments and discovering how things work',
      'Enjoy learning about the natural world and how it functions',
      'Find solving scientific problems challenging and rewarding',
      'Am fascinated by how science explains everyday phenomena'
    ],
    'Math': [
      'Enjoy the clarity and precision of working with numbers',
      'Like solving complex problems and puzzles',
      'Appreciate how mathematical concepts apply to real life',
      'Find satisfaction in reaching definitive answers'
    ],
    'English/Language Arts': [
      'Love reading stories and discussing literature',
      'Enjoy expressing my thoughts and ideas through writing',
      'Find analyzing texts and discovering deeper meanings rewarding',
      'Appreciate learning about different perspectives through books'
    ],
    'History/Social Studies': [
      'Am fascinated by how past events shape our current world',
      'Enjoy learning about different cultures and societies',
      'Find examining historical patterns and connections interesting',
      'Appreciate understanding the context behind current events'
    ],
    'Art/Music': [
      'Love expressing myself creatively',
      'Find creating something beautiful or meaningful fulfilling',
      'Enjoy learning techniques that help me improve my skills',
      'Appreciate the freedom to interpret assignments in my own way'
    ],
    'Physical Education': [
      'Enjoy being active and challenging my physical abilities',
      'Like the teamwork and social aspects of sports',
      'Find it a good break from academic work',
      'Appreciate learning about fitness and health'
    ]
  };

  const containerVariants = {
    initial: {
      opacity: 0,
      y: 20,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.3,
      },
    },
  };

  const dropdownVariants = {
    hidden: { 
      opacity: 0,
      y: -20,
      scale: 0.95,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    visible: { 
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
        mass: 0.8
      }
    },
    exit: { 
      opacity: 0,
      y: -20,
      scale: 0.95,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  const selectedOptionVariants = {
    initial: { scale: 0.9, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 20
      }
    }
  };

  const optionVariants = {
    hidden: { 
      opacity: 0,
      y: 20,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    visible: (i: number) => ({ 
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
        mass: 0.8,
        delay: i * 0.05
      }
    }),
    exit: { 
      opacity: 0,
      y: 20,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  const buttonVariants = {
    initial: { 
      opacity: 0,
      y: 20,
      scale: 0.9
    },
    animate: { 
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 20
      }
    },
    hover: { 
      scale: 1.05,
      backgroundColor: "rgba(255, 255, 255, 0.3)",
      boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: { 
      scale: 0.95,
      backgroundColor: "rgba(255, 255, 255, 0.25)"
    }
  };

  const arrowVariants = {
    initial: { x: -5 },
    hover: {
      x: 5,
      transition: {
        repeat: Infinity,
        repeatType: "reverse" as const,
        duration: 0.6,
        ease: "easeInOut"
      }
    }
  };

  useEffect(() => {
    if (currentPage === 2) {
      const traits = selectedTraits.map((trait, index) => 
        showTraitInputs[index] ? customTraits[index] : trait
      );
      const allTraitsFilled = traits.every(trait => trait.trim() !== '');
      setShowNextButton(allTraitsFilled);
    } else if (currentPage === 3) {
      const readyToProgress = 
        (selectedClass === 'Other' ? customClassName.trim() !== '' : selectedClass !== '') && 
        (selectedClass === 'Other' ? customReason.trim() !== '' : selectedReasons.length > 0);
      setShowNextButton(readyToProgress);
    } else if (currentPage === 4) {
      const activitiesValid = selectedActivities.every(id => !activityDetails[id] || activityDetails[id].trim() !== '');
      const hobbiesValid = selectedHobbies.every(id => !hobbyDetails[id] || hobbyDetails[id].trim() !== '');
      const hasSelections = selectedActivities.length > 0 && selectedHobbies.length > 0;
      setShowNextButton(activitiesValid && hobbiesValid && hasSelections);
    } else if (currentPage === 5) {
      const passionsValid = selectedPassions.length > 0 || (showCustomPassion && customPassion.trim() !== '');
      const traitsValid = selectedPersonalTraits.length > 0 || (showCustomTrait && customTrait.trim() !== '');
      setShowNextButton(passionsValid && traitsValid);
    } else if (currentPage === 6) {
      const pathsValid = selectedPaths.length > 0 && 
        selectedPaths.every(id => !pathDetails[id] || pathDetails[id].trim() !== '');
      const reasonsValid = selectedReasons.length > 0;
      const dreamsValid = selectedDreams.length > 0;
      setShowNextButton(pathsValid && reasonsValid && dreamsValid);
    }
  }, [currentPage, selectedTraits, customTraits, showTraitInputs, selectedClass, customClassName, selectedReasons, customReason, selectedActivities, selectedHobbies, activityDetails, hobbyDetails, selectedPassions, selectedPersonalTraits, customPassion, customTrait, showCustomPassion, showCustomTrait, selectedPaths, pathDetails, selectedDreams, showCustomDream, customDream]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && name.trim() !== '') {
      setNameConfirmed(true);
      setShowFirstSentence(true);
    }
  };

  const handleGradeSelect = (grade: string) => {
    setSelectedGrade(grade);
    if (grade) {
      setTimeout(() => {
        setCurrentPage(2);
        setShowPersonalitySection(true);
      }, 500);
    }
  };

  const handleTraitSelect = (index: number, value: string) => {
    const newTraits = [...selectedTraits];
    if (value === 'Other') {
      const newShowInputs = [...showTraitInputs];
      newShowInputs[index] = true;
      setShowTraitInputs(newShowInputs);
      newTraits[index] = '';
    } else {
      newTraits[index] = value;
    }
    setSelectedTraits(newTraits);
    setIsOpen(null);
  };

  const handleCustomTraitChange = (index: number, value: string) => {
    const newCustomTraits = [...customTraits];
    newCustomTraits[index] = value;
    setCustomTraits(newCustomTraits);
  };

  const toggleToDropdown = (index: number) => {
    const newShowInputs = [...showTraitInputs];
    newShowInputs[index] = false;
    setShowTraitInputs(newShowInputs);
    setSelectedTraits(prev => {
      const newTraits = [...prev];
      newTraits[index] = '';
      return newTraits;
    });
    setCustomTraits(prev => {
      const newCustomTraits = [...prev];
      newCustomTraits[index] = '';
      return newCustomTraits;
    });
  };

  const handleClassSelect = (className: string) => {
    setSelectedClass(className);
    setSelectedReasons([]);
    setCustomReason('');
    setCustomClassName('');
    setShowCustomReason(false);
    setIsOpen(null);
  };

  const handleReasonSelect = (reason: string) => {
    if (reason === 'Other') {
      setShowCustomReason(true);
    } else {
      setSelectedReasons(prev => {
        if (prev.includes(reason)) {
          return prev.filter(r => r !== reason);
        }
        if (prev.length < 2) {
          return [...prev, reason];
        }
        return prev;
      });
    }
  };

  const handleCustomReasonChange = (value: string) => {
    setCustomReason(value);
  };

  const handleActivityToggle = (activityId: string) => {
    setSelectedActivities(prev => {
      if (prev.includes(activityId)) {
        const newActivities = prev.filter(id => id !== activityId);
        const newDetails = { ...activityDetails };
        delete newDetails[activityId];
        setActivityDetails(newDetails);
        return newActivities;
      }
      return [...prev, activityId];
    });
  };

  const handleHobbyToggle = (hobbyId: string) => {
    setSelectedHobbies(prev => {
      if (prev.includes(hobbyId)) {
        const newHobbies = prev.filter(id => id !== hobbyId);
        const newDetails = { ...hobbyDetails };
        delete newDetails[hobbyId];
        setHobbyDetails(newDetails);
        return newHobbies;
      }
      return [...prev, hobbyId];
    });
  };

  const handleActivityDetailChange = (activityId: string, value: string) => {
    setActivityDetails(prev => ({
      ...prev,
      [activityId]: value
    }));
  };

  const handleHobbyDetailChange = (hobbyId: string, value: string) => {
    setHobbyDetails(prev => ({
      ...prev,
      [hobbyId]: value
    }));
  };

  const handlePassionSelect = (passion: string) => {
    if (passion === 'Other') {
      setShowCustomPassion(true);
    } else {
      setSelectedPassions(prev => {
        if (prev.includes(passion)) {
          return prev.filter(p => p !== passion);
        }
        return [...prev, passion];
      });
    }
  };

  const handlePersonalTraitSelect = (trait: string) => {
    if (trait === 'Other') {
      setShowCustomTrait(true);
    } else {
      setSelectedPersonalTraits(prev => {
        if (prev.includes(trait)) {
          return prev.filter(t => t !== trait);
        }
        return [...prev, trait];
      });
    }
  };

  const handlePathToggle = (pathId: string) => {
    setSelectedPaths(prev => {
      if (prev.includes(pathId)) {
        const newPaths = prev.filter(id => id !== pathId);
        const newDetails = { ...pathDetails };
        delete newDetails[pathId];
        setPathDetails(newDetails);
        return newPaths;
      }
      return [...prev, pathId];
    });
  };

  const handlePathDetailChange = (pathId: string, value: string) => {
    setPathDetails(prev => ({
      ...prev,
      [pathId]: value
    }));
  };

  const handleReasonToggle = (reason: string) => {
    setSelectedReasons(prev => {
      if (prev.includes(reason)) {
        if (reason === 'Other') {
          setShowCustomReason(false);
          setCustomReason('');
        }
        return prev.filter(r => r !== reason);
      }
      if (reason === 'Other') {
        setShowCustomReason(true);
      }
      return [...prev, reason];
    });
  };

  const handleDreamToggle = (dream: string) => {
    setSelectedDreams(prev => {
      if (prev.includes(dream)) {
        if (dream === 'Other') {
          setShowCustomDream(false);
          setCustomDream('');
        }
        return prev.filter(d => d !== dream);
      }
      if (dream === 'Other') {
        setShowCustomDream(true);
      }
      return [...prev, dream];
    });
  };

  const handleNext = () => {
    if (isNavigating) return;
    
    if (currentPage < 6) {
      setCurrentPage(prev => prev + 1);
      return;
    }
    
    setIsNavigating(true);
    
    const traits = selectedTraits.map((trait, index) => 
      showTraitInputs[index] ? customTraits[index] : trait
    );
    
    const finalSubject = selectedClass === 'Other' ? customClassName : selectedClass;
    const finalReasons = selectedClass === 'Other' ? [customReason] : selectedReasons;
    
    const finalActivities = selectedActivities.map(id => ({
      activity: activities.find(a => a.id === id)?.label || '',
      details: activityDetails[id] || ''
    }));

    const finalHobbies = selectedHobbies.map(id => ({
      hobby: hobbies.find(h => h.id === id)?.label || '',
      details: hobbyDetails[id] || ''
    }));

    const finalPassions = showCustomPassion 
      ? [customPassion, ...selectedPassions.filter(p => p !== 'Other')]
      : selectedPassions;

    const finalPersonalTraits = showCustomTrait
      ? [customTrait, ...selectedPersonalTraits.filter(t => t !== 'Other')]
      : selectedPersonalTraits;

    const finalPaths = selectedPaths.map(id => ({
      path: postHighSchoolPaths.find(p => p.id === id)?.label || '',
      details: pathDetails[id] || ''
    }));

    const finalPathReasons = selectedReasons.includes('Other') && customReason
      ? [...selectedReasons.filter(r => r !== 'Other'), customReason]
      : selectedReasons;

    const finalDreams = selectedDreams.includes('Other') && customDream
      ? [...selectedDreams.filter(d => d !== 'Other'), customDream]
      : selectedDreams;
    
    // Create the data to be passed to the dashboard
    const surveyData = {
      name,
      grade: selectedGrade,
      traits,
      subject: finalSubject,
      reasons: finalReasons,
      activities: finalActivities,
      hobbies: finalHobbies,
      passions: finalPassions,
      personalTraits: finalPersonalTraits,
      paths: finalPaths,
      pathReasons: finalPathReasons,
      dreams: finalDreams,
      gradeLevel: selectedGrade.replace(/[^0-9]/g, ''),
      academicInterests: [finalSubject],
      extracurriculars: finalActivities.map(a => a.activity)
    };

    // Store user in localStorage for auth
    localStorage.setItem('potentiallyUser', name);
    
    // Also store survey data in localStorage as a backup
    localStorage.setItem('potentiallyUserData', JSON.stringify(surveyData));
    
    // Create user first to ensure they are registered
    userService.createUser(name)
      .then(() => {
        // Then save survey data
        return userService.saveSurvey(name, surveyData);
      })
      .then(() => {
        // Fire a custom event to notify App.tsx about user login
        window.dispatchEvent(new Event("userLoggedIn"));
        
        // Give some time for the App component to update
        setTimeout(() => {
          // Navigate to the dashboard with the survey data
          navigate('/', {
            state: surveyData
          });
        }, 100);
      })
      .catch(err => {
        console.error("Error during user creation or saving survey data:", err);
        // Navigate anyway, but show error
        navigate('/', {
          state: surveyData
        });
      });
  };

  const CustomSelect = ({ options, value, onChange, placeholder, index }: { 
    options: string[], 
    value: string, 
    onChange: (value: string) => void,
    placeholder: string,
    index: number
  }) => (
    <div className="relative inline-block">
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        onClick={() => setIsOpen(isOpen === index ? null : index)}
        className={`w-[300px] min-h-[80px] text-[48px] px-6 py-2 cursor-pointer transition-all duration-200 flex items-center justify-center bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20 shadow-lg ${value ? 'hover:bg-white/20' : 'hover:bg-white/15'}`}
      >
        {value ? (
          <motion.span
            variants={selectedOptionVariants}
            initial="initial"
            animate="animate"
            className="text-white flex items-center gap-2 leading-tight"
          >
            <span className="relative whitespace-normal text-center">
              {value}
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/40 rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              />
            </span>
          </motion.span>
        ) : (
          <span className="text-white/50">{placeholder}</span>
        )}
        <motion.div
          animate={{ rotate: isOpen === index ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="absolute right-4"
        >
          <ChevronDown className="w-6 h-6 text-white/70 flex-shrink-0" />
        </motion.div>
      </motion.div>
      <AnimatePresence>
        {isOpen === index && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute left-0 w-[300px] mt-2 bg-white/90 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.3)] overflow-hidden z-50 border border-white/20"
          >
            <motion.div className="py-2">
              {options.map((option, i) => (
                <motion.div
                  key={option}
                  custom={i}
                  variants={optionVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  onClick={() => {
                    onChange(option);
                    setIsOpen(null);
                  }}
                  whileHover={{ scale: 1.02, backgroundColor: "rgba(0,0,0,0.05)" }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 text-[20px] text-gray-800 cursor-pointer transition-colors duration-150 whitespace-normal break-words"
                >
                  {option}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full min-h-screen max-w-[1440px] mx-auto flex items-center justify-center py-8"
    >
      <div className="w-full bg-gradient-to-b from-[#6B46C1] to-[#3B82F6] p-8">
        <Card className="w-full max-w-[1260px] mx-auto border-none bg-white/10 backdrop-blur-md rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
          <CardContent className="p-12">
            {currentPage === 1 && (
              <div className="w-full flex flex-col gap-8 justify-center items-center">
                <div className="text-[64px] text-white flex items-center gap-2">
                  <div className="flex items-center">
                    <Typewriter
                      onInit={(typewriter) => {
                        typewriter
                          .typeString("Hi, my name is")
                          .callFunction(() => {
                            setShowNameInput(true);
                          })
                          .start();
                      }}
                      options={{
                        delay: 50,
                        cursor: ''
                      }}
                    />
                  </div>
                  {showNameInput && (
                    <div className="inline-flex items-center gap-2">
                      <input
                        id="nameInput"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-48 text-[64px] px-6 py-2 border border-white/20 rounded-2xl focus:outline-none focus:border-white/40 bg-white/10 text-white placeholder-white/50 transition-all duration-200 hover:bg-white/15 text-center backdrop-blur-sm shadow-lg"
                        placeholder="____"
                        autoFocus
                      />
                      <span>.</span>
                    </div>
                  )}
                </div>
                
                {nameConfirmed && (
                  <div className="text-[64px] text-white flex items-center gap-2">
                    <div className="flex items-center">
                      <Typewriter
                        onInit={(typewriter) => {
                          typewriter
                            .typeString("I'm a")
                            .callFunction(() => {
                              setShowSecondSentence(true);
                            })
                            .start();
                        }}
                        options={{
                          delay: 50,
                          cursor: ''
                        }}
                      />
                    </div>
                    {showSecondSentence && (
                      <div className="inline-flex items-center gap-2">
                        {selectedGrade ? (
                          <motion.div
                            variants={selectedOptionVariants}
                            initial="initial"
                            animate="animate"
                            className="px-6 py-2 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-sm shadow-lg"
                          >
                            <span className="relative">
                              {selectedGrade}
                              <motion.div
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/40 rounded-full"
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ duration: 0.3, delay: 0.1 }}
                              />
                            </span>
                          </motion.div>
                        ) : (
                          <CustomSelect
                            options={grades}
                            value={selectedGrade}
                            onChange={handleGradeSelect}
                            placeholder="____"
                            index={0}
                          />
                        )}
                        <span>.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {currentPage === 2 && (
              <div className="w-full flex flex-col gap-8 justify-center items-center">
                <div className="text-[48px] text-white flex items-center gap-4">
                  Hi, my name is
                  <motion.div
                    variants={selectedOptionVariants}
                    initial="initial"
                    animate="animate"
                    className="px-6 py-2 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-sm shadow-lg"
                  >
                    <span className="relative">
                      {name}
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/40 rounded-full"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                      />
                    </span>
                  </motion.div>
                  .
                </div>
                <div className="text-[48px] text-white flex items-center gap-4">
                  I'm a
                  <motion.div
                    variants={selectedOptionVariants}
                    initial="initial"
                    animate="animate"
                    className="px-6 py-2 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-sm shadow-lg"
                  >
                    <span className="relative">
                      {selectedGrade}
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/40 rounded-full"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                      />
                    </span>
                  </motion.div>
                  .
                </div>
                
                <div className="text-[48px] text-white flex flex-col items-center gap-8">
                  <div className="flex items-center text-center">
                    <Typewriter
                      onInit={(typewriter) => {
                        typewriter
                          .typeString("People who know me best would say I'm")
                          .start();
                      }}
                      options={{
                        delay: 50,
                        cursor: ''
                      }}
                    />
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-4 max-w-[1000px]">
                    {[
                      { traits: firstTraits, index: 1 },
                      { traits: secondTraits, index: 2 },
                      { traits: thirdTraits, index: 3 }
                    ].map(({ traits, index }, arrayIndex) => (
                      <React.Fragment key={index}>
                        {arrayIndex === 2 && <span className="mx-2">and</span>}
                        {showTraitInputs[index - 1] ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={customTraits[index - 1]}
                              onChange={(e) => handleCustomTraitChange(index - 1, e.target.value)}
                              className="w-[300px] text-[48px] px-6 py-2 border border-white/20 rounded-2xl focus:outline-none focus:border-white/40 bg-white/10 text-white placeholder-white/50 transition-all duration-200 hover:bg-white/15 text-center backdrop-blur-sm shadow-lg"
                              placeholder="Enter trait"
                              autoFocus
                            />
                            <button
                              onClick={() => toggleToDropdown(index - 1)}
                              className="text-[24px] text-white/70 hover:text-white transition-colors duration-200"
                            >
                              ↺
                            </button>
                          </div>
                        ) : (
                          <CustomSelect
                            options={[...traits, 'Other']}
                            value={selectedTraits[index - 1]}
                            onChange={(value) => handleTraitSelect(index - 1, value)}
                            placeholder="____"
                            index={index}
                          />
                        )}
                        {arrayIndex < 1 && <span>,</span>}
                        {arrayIndex === 2 && <span>.</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {showNextButton && (
                  <motion.button
                    variants={buttonVariants}
                    initial="initial"
                    animate="animate"
                    whileHover="hover"
                    whileTap="tap"
                    onClick={handleNext}
                    className="mt-12 px-12 py-6 bg-white/20 rounded-full text-white text-[28px] font-light tracking-wide backdrop-blur-sm border border-white/20 shadow-lg flex items-center gap-4 relative overflow-hidden"
                  >
                    <span>Continue</span>
                    <motion.div
                      variants={arrowVariants}
                      className="flex items-center"
                    >
                      <ChevronDown className="w-8 h-8 rotate-[-90deg]" />
                    </motion.div>
                  </motion.button>
                )}
              </div>
            )}

            {currentPage === 3 && (
              <div className="w-full flex flex-col gap-8 justify-center items-center">
                <div className="text-[48px] text-white flex flex-col items-center gap-8">
                  <div className="flex items-center text-center">
                    <Typewriter
                      onInit={(typewriter) => {
                        typewriter
                          .typeString("My favorite classes at school are")
                          .start();
                      }}
                      options={{
                        delay: 50,
                        cursor: ''
                      }}
                    />
                  </div>
                  <CustomSelect
                    options={classes}
                    value={selectedClass}
                    onChange={handleClassSelect}
                    placeholder="____"
                    index={4}
                  />

                  {selectedClass && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col items-center gap-6"
                    >
                      {selectedClass === 'Other' && (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={customClassName}
                            onChange={(e) => setCustomClassName(e.target.value)}
                            className="w-[600px] text-[24px] px-6 py-3 border border-white/20 rounded-full focus:outline-none focus:border-white/40 bg-white/10 text-white placeholder-white/50 transition-all duration-200 hover:bg-white/15 text-center backdrop-blur-sm shadow-lg"
                            placeholder="Enter your favorite class..."
                            autoFocus
                          />
                        </div>
                      )}
                      <div className="text-[32px] text-white/90 mt-4">
                        because I... (Select all that apply)
                      </div>
                      <div className="flex flex-wrap justify-center gap-4 max-w-[800px]">
                        {selectedClass === 'Other' ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={customReason}
                              onChange={(e) => handleCustomReasonChange(e.target.value)}
                              className="w-[600px] text-[24px] px-6 py-3 border border-white/20 rounded-full focus:outline-none focus:border-white/40 bg-white/10 text-white placeholder-white/50 transition-all duration-200 hover:bg-white/15 text-center backdrop-blur-sm shadow-lg"
                              placeholder="Enter your reason..."
                            />
                          </div>
                        ) : (
                          [...(reasonsByClass[selectedClass as keyof typeof reasonsByClass] || []), 'Other'].map((reason, index) => (
                            <motion.button
                              key={index}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.1 }}
                              onClick={() => handleReasonSelect(reason)}
                              className={`px-6 py-3 rounded-full text-[20px] border backdrop-blur-sm shadow-lg transition-all duration-300 ${
                                (selectedReasons.includes(reason) || (reason === 'Other' && showCustomReason))
                                  ? 'bg-white/40 text-white border-white shadow-[0_4px_20px_rgba(255,255,255,0.3)] scale-105 font-medium'
                                  : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white border-white/20 hover:scale-102'
                              }`}
                            >
                              {reason}
                            </motion.button>
                          ))
                        )}
                      </div>
                      {showCustomReason && selectedClass !== 'Other' && (
                        <div className="flex items-center gap-2 mt-4">
                          <input
                            type="text"
                            value={customReason}
                            onChange={(e) => handleCustomReasonChange(e.target.value)}
                            className="w-[600px] text-[24px] px-6 py-3 border border-white/20 rounded-full focus:outline-none focus:border-white/40 bg-white/10 text-white placeholder-white/50 transition-all duration-200 hover:bg-white/15 text-center backdrop-blur-sm shadow-lg"
                            placeholder="Enter your reason..."
                            autoFocus
                          />
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>

                {showNextButton && (
                  <motion.button
                    variants={buttonVariants}
                    initial="initial"
                    animate="animate"
                    whileHover="hover"
                    whileTap="tap"
                    onClick={handleNext}
                    className="mt-12 px-12 py-6 bg-white/20 rounded-full text-white text-[28px] font-light tracking-wide backdrop-blur-sm border border-white/20 shadow-lg flex items-center gap-4 relative overflow-hidden"
                  >
                    <span>Continue</span>
                    <motion.div
                      variants={arrowVariants}
                      className="flex items-center"
                    >
                      <ChevronDown className="w-8 h-8 rotate-[-90deg]" />
                    </motion.div>
                  </motion.button>
                )}
              </div>
            )}

            {currentPage === 4 && (
              <div className="w-full flex flex-col gap-8 justify-center items-center">
                <div className="text-[48px] text-white flex flex-col items-center gap-8">
                  <div className="flex items-center text-center">
                    <Typewriter
                      onInit={(typewriter) => {
                        typewriter
                          .typeString("Tell me about your activities")
                          .start();
                      }}
                      options={{
                        delay: 50,
                        cursor: ''
                      }}
                    />
                  </div>

                  <div className="w-full max-w-[800px] space-y-8">
                    <div className="space-y-4">
                      <h2 className="text-[32px] text-white/90">I participate in:</h2>
                      <div className="grid grid-cols-1 gap-4">
                        {activities.map((activity) => (
                          <div key={activity.id} className="space-y-2">
                            <motion.button
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              onClick={() => handleActivityToggle(activity.id)}
                              className={`w-full px-6 py-3 rounded-xl text-[20px] border backdrop-blur-sm shadow-lg transition-all duration-300 text-left ${
                                selectedActivities.includes(activity.id)
                                  ? 'bg-white/40 text-white border-white shadow-[0_4px_20px_rgba(255,255,255,0.3)]'
                                  : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white border-white/20'
                              }`}
                            >
                              {activity.label}
                            </motion.button>
                            {selectedActivities.includes(activity.id) && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="pl-6"
                              >
                                <input
                                  type="text"
                                  value={activityDetails[activity.id] || ''}
                                  onChange={(e) => handleActivityDetailChange(activity.id, e.target.value)}
                                  placeholder={activity.prompt}
                                  className="w-full text-[18px] px-4 py-2 border border-white/20 rounded-lg focus:outline-none focus:border-white/40 bg-white/10 text-white placeholder-white/50 transition-all duration-200 hover:bg-white/15"
                                />
                              </motion.div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-[32px] text-white/90">I spend my time:</h2>
                      <div className="grid grid-cols-1 gap-4">
                        {hobbies.map((hobby) => (
                          <div key={hobby.id} className="space-y-2">
                            <motion.button
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              onClick={() => handleHobbyToggle(hobby.id)}
                              className={`w-full px-6 py-3 rounded-xl text-[20px] border backdrop-blur-sm shadow-lg transition-all duration-300 text-left ${
                                selectedHobbies.includes(hobby.id)
                                  ? 'bg-white/40 text-white border-white shadow-[0_4px_20px_rgba(255,255,255,0.3)]'
                                  : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white border-white/20'
                              }`}
                            >
                              {hobby.label}
                            </motion.button>
                            {selectedHobbies.includes(hobby.id) && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="pl-6"
                              >
                                <input
                                  type="text"
                                  value={hobbyDetails[hobby.id] || ''}
                                  onChange={(e) => handleHobbyDetailChange(hobby.id, e.target.value)}
                                  placeholder={hobby.prompt}
                                  className="w-full text-[18px] px-4 py-2 border border-white/20 rounded-lg focus:outline-none focus:border-white/40 bg-white/10 text-white placeholder-white/50 transition-all duration-200 hover:bg-white/15"
                                />
                              </motion.div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {showNextButton && (
                  <motion.button
                    variants={buttonVariants}
                    initial="initial"
                    animate="animate"
                    whileHover="hover"
                    whileTap="tap"
                    onClick={handleNext}
                    className="mt-12 px-12 py-6 bg-white/20 rounded-full text-white text-[28px] font-light tracking-wide backdrop-blur-sm border border-white/20 shadow-lg flex items-center gap-4 relative overflow-hidden"
                  >
                    <span>Continue</span>
                    <motion.div
                      variants={arrowVariants}
                      className="flex items-center"
                    >
                      <ChevronDown className="w-8 h-8 rotate-[-90deg]" />
                    </motion.div>
                  </motion.button>
                )}
              </div>
            )}

            {currentPage === 5 && (
              <div className="w-full flex flex-col gap-8 justify-center items-center">
                <div className="text-[48px] text-white flex flex-col items-center gap-12">
                  <div className="space-y-8">
                    <div className="flex items-center text-center">
                      <Typewriter
                        onInit={(typewriter) => {
                          typewriter
                            .typeString("I love...")
                            .start();
                        }}
                        options={{
                          delay: 50,
                          cursor: ''
                        }}
                      />
                    </div>
                    <div className="flex flex-wrap justify-center gap-4">
                      {passions.map((passion, index) => (
                        <motion.button
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={() => handlePassionSelect(passion)}
                          className={`px-6 py-3 rounded-full text-[20px] border backdrop-blur-sm shadow-lg transition-all duration-300 ${
                            (selectedPassions.includes(passion) || (passion === 'Other' && showCustomPassion))
                              ? 'bg-white/40 text-white border-white shadow-[0_4px_20px_rgba(255,255,255,0.3)] scale-105 font-medium'
                              : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white border-white/20 hover:scale-102'
                          }`}
                        >
                          {passion}
                        </motion.button>
                      ))}
                    </div>
                    {showCustomPassion && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-center"
                      >
                        <input
                          type="text"
                          value={customPassion}
                          onChange={(e) => setCustomPassion(e.target.value)}
                          placeholder="What else do you love?"
                          className="w-[600px] text-[24px] px-6 py-3 border border-white/20 rounded-full focus:outline-none focus:border-white/40 bg-white/10 text-white placeholder-white/50 transition-all duration-200 hover:bg-white/15 text-center backdrop-blur-sm shadow-lg"
                          autoFocus
                        />
                      </motion.div>
                    )}
                  </div>

                  <div className="space-y-8">
                    <div className="flex items-center text-center">
                      <Typewriter
                        onInit={(typewriter) => {
                          typewriter
                            .typeString("I am someone who...")
                            .start();
                        }}
                        options={{
                          delay: 50,
                          cursor: ''
                        }}
                      />
                    </div>
                    <div className="flex flex-wrap justify-center gap-4">
                      {personalTraits.map((trait, index) => (
                        <motion.button
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={() => handlePersonalTraitSelect(trait)}
                          className={`px-6 py-3 rounded-full text-[20px] border backdrop-blur-sm shadow-lg transition-all duration-300 ${
                            (selectedPersonalTraits.includes(trait) || (trait === 'Other' && showCustomTrait))
                              ? 'bg-white/40 text-white border-white shadow-[0_4px_20px_rgba(255,255,255,0.3)] scale-105 font-medium'
                              : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white border-white/20 hover:scale-102'
                          }`}
                        >
                          {trait}
                        </motion.button>
                      ))}
                    </div>
                    {showCustomTrait && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-center"
                      >
                        <input
                          type="text"
                          value={customTrait}
                          onChange={(e) => setCustomTrait(e.target.value)}
                          placeholder="Describe in your own words"
                          className="w-[600px] text-[24px] px-6 py-3 border border-white/20 rounded-full focus:outline-none focus:border-white/40 bg-white/10 text-white placeholder-white/50 transition-all duration-200 hover:bg-white/15 text-center backdrop-blur-sm shadow-lg"
                          autoFocus
                        />
                      </motion.div>
                    )}
                  </div>
                </div>

                {showNextButton && (
                  <motion.button
                    variants={buttonVariants}
                    initial="initial"
                    animate="animate"
                    whileHover="hover"
                    whileTap="tap"
                    onClick={handleNext}
                    className="mt-12 px-12 py-6 bg-white/20 rounded-full text-white text-[28px] font-light tracking-wide backdrop-blur-sm border border-white/20 shadow-lg flex items-center gap-4 relative overflow-hidden"
                  >
                    <span>Continue</span>
                    <motion.div
                      variants={arrowVariants}
                      className="flex items-center"
                    >
                      <ChevronDown className="w-8 h-8 rotate-[-90deg]" />
                    </motion.div>
                  </motion.button>
                )}
              </div>
            )}

            {currentPage === 6 && (
              <div className="w-full flex flex-col gap-8 justify-center items-center">
                <div className="text-[48px] text-white flex flex-col items-center gap-12">
                  <div className="space-y-8">
                    <div className="flex items-center text-center">
                      <Typewriter
                        onInit={(typewriter) => {
                          typewriter
                            .typeString("After high school, I'm considering...")
                            .start();
                        }}
                        options={{
                          delay: 50,
                          cursor: ''
                        }}
                      />
                    </div>
                    <div className="w-full max-w-[800px] space-y-4">
                      <div className="text-[24px] text-white/70 mb-4">
                        What are you considering doing after high school? (You can pick more than one.)
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        {postHighSchoolPaths.map((path) => (
                          <div key={path.id} className="space-y-2">
                            <motion.button
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              onClick={() => handlePathToggle(path.id)}
                              className={`w-full px-6 py-3 rounded-xl text-[20px] border backdrop-blur-sm shadow-lg transition-all duration-300 text-left ${
                                selectedPaths.includes(path.id)
                                  ? 'bg-white/40 text-white border-white shadow-[0_4px_20px_rgba(255,255,255,0.3)]'
                                  : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white border-white/20'
                              }`}
                            >
                              {path.label}
                            </motion.button>
                            {selectedPaths.includes(path.id) && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="pl-6"
                              >
                                <input
                                  type="text"
                                  value={pathDetails[path.id] || ''}
                                  onChange={(e) => handlePathDetailChange(path.id, e.target.value)}
                                  placeholder={path.prompt}
                                  className="w-full text-[18px] px-4 py-2 border border-white/20 rounded-lg focus:outline-none focus:border-white/40 bg-white/10 text-white placeholder-white/50 transition-all duration-200 hover:bg-white/15"
                                />
                              </motion.div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="flex items-center text-center">
                      <Typewriter
                        onInit={(typewriter) => {
                          typewriter
                            .typeString("Because...")
                            .start();
                        }}
                        options={{
                          delay: 50,
                          cursor: ''
                        }}
                      />
                    </div>
                    <div className="w-full max-w-[800px] space-y-4">
                      <div className="text-[24px] text-white/70 mb-4">
                        Why does that path interest you? (Select all that apply)
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        {pathReasons.map((reason, index) => (
                          <motion.button
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => handleReasonToggle(reason)}
                            className={`w-full px-6 py-3 rounded-xl text-[20px] border backdrop-blur-sm shadow-lg transition-all duration-300 text-left ${
                              selectedReasons.includes(reason)
                                ? 'bg-white/40 text-white border-white shadow-[0_4px_20px_rgba(255,255,255,0.3)]'
                                : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white border-white/20'
                            }`}
                          >
                            {reason}
                          </motion.button>
                        ))}
                      </div>
                      {showCustomReason && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pl-6"
                        >
                          <input
                            type="text"
                            value={customReason}
                            onChange={(e) => setCustomReason(e.target.value)}
                            placeholder="Please describe your reason..."
                            className="w-full text-[18px] px-4 py-2 border border-white/20 rounded-lg focus:outline-none focus:border-white/40 bg-white/10 text-white placeholder-white/50 transition-all duration-200 hover:bg-white/15"
                            autoFocus
                          />
                        </motion.div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="flex items-center text-center">
                      <Typewriter
                        onInit={(typewriter) => {
                          typewriter
                            .typeString("And I dream of...")
                            .start();
                        }}
                        options={{
                          delay: 50,
                          cursor: ''
                        }}
                      />
                    </div>
                    <div className="w-full max-w-[800px] space-y-4">
                      <div className="text-[24px] text-white/70 mb-4">
                        What are your big dreams or aspirations for the future? (Select all that apply)
                      </div>
                      <div className="flex flex-wrap justify-center gap-4">
                        {dreams.map((dream, index) => (
                          <motion.button
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => handleDreamToggle(dream)}
                            className={`px-6 py-3 rounded-full text-[20px] border backdrop-blur-sm shadow-lg transition-all duration-300 ${
                              selectedDreams.includes(dream)
                                ? 'bg-white/40 text-white border-white shadow-[0_4px_20px_rgba(255,255,255,0.3)] scale-105 font-medium'
                                : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white border-white/20 hover:scale-102'
                            }`}
                          >
                            {dream}
                          </motion.button>
                        ))}
                      </div>
                      {showCustomDream && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex justify-center mt-4"
                        >
                          <input
                            type="text"
                            value={customDream}
                            onChange={(e) => setCustomDream(e.target.value)}
                            placeholder="What do you dream of doing?"
                            className="w-[600px] text-[18px] px-6 py-3 border border-white/20 rounded-full focus:outline-none focus:border-white/40 bg-white/10 text-white placeholder-white/50 transition-all duration-200 hover:bg-white/15 text-center backdrop-blur-sm shadow-lg"
                            autoFocus
                          />
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>

                {showNextButton && (
                  <motion.button
                    variants={buttonVariants}
                    initial="initial"
                    animate="animate"
                    whileHover="hover"
                    whileTap="tap"
                    onClick={handleNext}
                    className="mt-12 px-12 py-6 bg-white/20 rounded-full text-white text-[28px] font-light tracking-wide backdrop-blur-sm border border-white/20 shadow-lg flex items-center gap-4 relative overflow-hidden"
                  >
                    <span>Continue</span>
                    <motion.div
                      variants={arrowVariants}
                      className="flex items-center"
                    >
                      <ChevronDown className="w-8 h-8 rotate-[-90deg]" />
                    </motion.div>
                  </motion.button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default Element;