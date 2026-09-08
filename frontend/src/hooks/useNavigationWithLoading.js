import { useNavigate } from 'react-router-dom';
import { useLoading } from '../context/LoadingContext';

export const useNavigationWithLoading = () => {
  const navigate = useNavigate();
  const { startLoading, stopLoading } = useLoading();

  const navigateWithLoading = (to, options = {}) => {
    startLoading();
    
    // Simulate a small delay to show the preloader
    setTimeout(() => {
      navigate(to, options);
      // Stop loading after navigation
      setTimeout(() => {
        stopLoading();
      }, 100);
    }, 300);
  };

  return { navigateWithLoading };
};
