// import { SpotifyAuth } from "react-spotify-auth";
import axios from 'axios'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { SpotifyAuth, Scopes } from 'react-spotify-auth'
import 'react-spotify-auth/dist/index.css'
import { Home } from './Home'
import { setToken } from './redux/store/global'

export const App = () => {
  // const [token, setToken] = useState(null)
  const dispatch = useDispatch();
  const globalStore = useSelector(state => state.global)

  const getToken = (token) => {
    // setToken(token)
    console.log('TOKEN', token);
    dispatch(setToken(token))
    axios.interceptors.request.use(async function (config) {
      if (token) config.headers['Authorization'] = `Bearer ${token}`;

      return config;
    }, function (error) {
      return Promise.reject(error);
    });
  }

  return (
    <div className="App container mx-auto pt-10">
      <h1 className='text-3xl font-semibold text-center mb-10'>Festival Artist Discovering</h1>

      {!globalStore.token ? <SpotifyAuth
        redirectUri='http://localhost:3000'
        clientID='0ed8422ace1346908c1be4d6b1bdb282'
        scopes={[Scopes.userReadPrivate, Scopes.userReadEmail, Scopes.playlistModifyPrivate]}
        onAccessToken={getToken}
      /> : <Home />}
    </div>
  );
}

export default App;
