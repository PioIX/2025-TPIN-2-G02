import { useState } from 'react';

const useIp = () => { 
  const [ip, setIp] = useState("10.1.5.100");

  return { ip };
};

export { useIp };
