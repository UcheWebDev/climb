import React from 'react';
import Header from './components/Header';
import GameLayout from './components/GameLayout';
import RecentGames from './components/RecentGames';
import { Switch, Route } from 'wouter';
import { AuthProviderWithGoogle } from './context/AuthContext';
import HowToPlay from './components/HowToPlay';
import TermsOfUse from './components/TermsOfUse';
import Profile from './components/Profile';

function App() {
  return (
    <AuthProviderWithGoogle>
      <div className="App min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto flex justify-center items-start p-4">
          <Switch>
            <Route path="/how-to-play" component={HowToPlay} />
            <Route path="/terms" component={TermsOfUse} />
            <Route path="/profile" component={Profile} />
            <Route path="/">
              <div className="flex flex-col md:flex-row gap-8 w-full max-w-xl rounded-full  shadow-sm hover:shadow-md transition-shadow">
                <div className="flex-1">
                  <GameLayout />
                </div>
               
              </div>
            </Route>
            <Route path="/game/:id">
              <div className="flex flex-col md:flex-row gap-8 w-full max-w-xl ">
                <div className="flex-1">
                  <GameLayout />
                </div>
              </div>
            </Route>
            <Route path="/recent-games">
              <div className="flex flex-col md:flex-row gap-8 w-full max-w-xl ">
                <div className="flex-1">
                  <RecentGames />
                </div>
              </div>
            </Route>
          </Switch>
        </main>
      </div>
    </AuthProviderWithGoogle>
  );
}

export default App;