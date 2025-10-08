// frontend/src/context/ContentContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchWebsiteContent, updateContent } from '../api/contentService'; 

const ContentContext = createContext({});

export const useContent = () => useContext(ContentContext);

export function ContentProvider({ children }) {
  const [content, setContent] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const loadContent = async () => {
    const data = await fetchWebsiteContent();
    setContent(data);
    setIsLoading(false);
  };
  
  useEffect(() => {
    loadContent();
  }, []); 

  const updateContentAndState = async (key, newValue) => {
    const result = await updateContent(key, newValue);

    if (result.success) {
      // Si la BD se actualizó, actualizamos el estado de React inmediatamente
      setContent(prevContent => ({
        ...prevContent,
        [key]: newValue, 
      }));
    }
    
    return result; 
  };

  const contextValue = {
    content,
    isLoading,
    updateContentAndState, 
    refetchContent: loadContent, 
  };

  return (
    <ContentContext.Provider value={contextValue}>
      {isLoading ? <div>Cargando contenidos del sitio...</div> : children}
    </ContentContext.Provider>
  );
}