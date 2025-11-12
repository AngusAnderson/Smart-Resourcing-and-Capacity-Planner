import { useState } from 'react';

function useToggle(initialState = false) {
  const [isToggled, setIsToggled] = useState(initialState);

  const toggle = () => {
    setIsToggled(current => !current);
  };

  return [isToggled, toggle];
}

export default useToggle;
