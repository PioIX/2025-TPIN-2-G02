import { useState } from 'react';

const useIp = () => { 
  const [ip, setIp] = useState("192.168.0.73");

  return { ip };
};

export { useIp };
