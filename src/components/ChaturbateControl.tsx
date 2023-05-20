import styled from 'styled-components';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useUser } from '../composable/user';

const StyledForm = styled(({ className, children, onSubmit }) => (
    <form className={className} onSubmit={onSubmit}>
        {children}
    </form>
))`
    display: grid;
`;
    
const StyledGrid = styled(({ className, children }) => (
    <div className={className}>
        {children}
    </div>
))`
    width: max(20rem, 30%);
    height: 100vh;
    margin-left: auto;
    margin-right: auto;
    padding-top: 3rem;
    padding-left: 1rem;
    padding-right: 1rem;
    grid-template-rows: min-content 1fr;
    grid-template-columns: 1fr;
    
    background: ${props => props.theme.color.cold2};
    
    display: grid;
`;
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default function LoginForm() {
    const user = useUser();
    
    const [token, setToken] = useState<string | undefined>(undefined);
    const [calc, setCalc] = useState<string | undefined>(undefined);
    
    const [stopped, setStopped] = useState(true);
    const stoppedRef = useRef(stopped);

    useEffect(() => {
      stoppedRef.current = stopped;
    }, [stopped]);
    
    const processTip = async (tip: any) => {
      const tokens = tip.tip.tokens;
      const secondsToAdd = eval(`(function(tokens) { return ${calc}; })(${tokens})`);
      
      const locks: any[] = await fetch("https://api.chaster.app/locks", {
          method: "GET",
          headers: {
              authorization: "Bearer " + user.accessToken,
              'Content-Type': 'application/json',
          },
      }).then(r => r.json());
      
      const lock = locks.find(l => l.status == "locked");

      await fetch("https://api.chaster.app/locks/" + lock._id + "/update-time", {
          method: "POST",
          headers: {
              authorization: "Bearer " + user.accessToken,
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              duration: secondsToAdd,
          }),
      });
    };

    const processEvents = (events: any[]) => {
      for (const event of events) {
        if (event.method == "tip") {
          processTip(event.object);
        }
      }
    };
    
    const toggleRun = () => {
      setStopped(stopped => {
        return !stopped;
      });

      poll(!stoppedRef.current);
    };
    
    const getUrl = useCallback(() => "https://eventsapi.chaturbate.com/events/" + token + "/?timeout=2", [token]);
    
    const poll = async (stopped: boolean, url?: string) => {
      if (stopped) return;
      
      url = url || getUrl();

      const start = Date.now();
      const result = await fetch(url).then(r => r.json());
      
      const { nextUrl, events } = result;
      
      processEvents(events);
      // processEvents([{method:"tip", object: { tip: { tokens: 25 } }}]);
      
      await sleep(Math.max(0, 2000 - (Date.now() - start)));
      await poll(stoppedRef.current, nextUrl);
    };

    return (
        <StyledGrid>
            <StyledForm>
                <label htmlFor="token">Chaturbate token:</label>
                <input onChange={e => setToken(e.target.value)} id="token" type="text" />
                <label htmlFor="calc">Calculate time to add in seconds:</label>
                <input onChange={e => setCalc(e.target.value)} id="calc" type="text" />
                <input type="submit" value={stopped ? "Start" : "Stop"} onClick={() => toggleRun()}/>
            </StyledForm>
        </StyledGrid>
    )
}