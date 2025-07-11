import React, { useState } from 'react';
import ProjectLeaderProfile from './ProjectLeaderProfile';

interface ProjectLeaderProfileManagerProps {
  initialMode?: 'view' | 'edit';
}

const ProjectLeaderProfileManager: React.FC<ProjectLeaderProfileManagerProps> = ({ 
  initialMode = 'view' 
}) => {
  const [currentMode, setCurrentMode] = useState<'view' | 'edit'>(initialMode);

  const handleModeChange = (mode: 'view' | 'edit') => {
    setCurrentMode(mode);
  };

  return (
    <ProjectLeaderProfile 
      mode={currentMode} 
      onModeChange={handleModeChange} 
    />
  );
};

export default ProjectLeaderProfileManager;
