import { Suspense, lazy, createContext } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { Routes, Route } from "react-router-dom";

import ChaturbateControl from './components/ChaturbateControl';
import { createUser, UserContext } from './composable/user';
import Banner from './components/Banner';

const theme = {
  color: {
    accent1: "#721817",
    accent2: "#0B6E4F",
    warm: "#FA9F42",
    cold1: "#2B4162",
    cold2: "#E0E0E2"
  },
  font: "Roboto, sans-serif",
};

const GlobalStyle = styled.div`
  > * {
    font-family: ${props => props.theme.font};
  }
`;

const LoginForm = lazy(() => import('./components/LoginForm'));

function App() {
  // TODO: NoMatch, Random welcome message
  // {/* <Route path="*" element={<NoMatch />} /> */}

  const user = createUser();

  return (
    <ThemeProvider theme={theme}>
      <UserContext.Provider value={user}>
        <GlobalStyle>
          <Banner />
          <Routes>
            <Route path="/">
              <Route index element={<ChaturbateControl />} />
              <Route path="login" element={
                <Suspense fallback={<>...</>}>
                  <LoginForm />
                </Suspense>
              } />
            </Route>
          </Routes> 
        </GlobalStyle>
      </UserContext.Provider>
    </ThemeProvider>
  )
}

export default App
