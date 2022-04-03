import axios from "axios"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import ARTISTS from './artists.json'
import slug from 'slug'
import prettyMilliseconds from 'pretty-ms'
import { uniq } from "lodash"

export const Home = () => {
    const globalStore = useSelector(state => state.global)
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [playlist, setPlaylist] = useState([])
    const [slice, setSlice] = useState(3)
    const [selectedTracks, setSelectedTracks] = useState([])
    const [unfoundArtist, setUnfoundArtist] = useState([])
    const [playlistName, setPlaylistName] = useState(null)
    const [generating, setGenerating] = useState(false)

    useEffect(() => {
        async function fetchData() {
            await axios.get(`https://api.spotify.com/v1/me`).then(({ data }) => {
                setUser(data)
                setLoading(false)
            })

            let artists = []
            for (const name of ARTISTS) {
                const { data } = await axios.get(`https://api.spotify.com/v1/search?q=${slug(name)}&type=artist&limit=1`)

                const artist = data.artists
                const artistId = artist?.items[0]?.id
                if (artistId) {
                    const tracks = await axios.get(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=BE`)

                    const infos = await axios.get(`https://api.spotify.com/v1/artists/${artistId}`,)

                    artists = [...artists, {
                        ...artist,
                        infos: infos.data,
                        tracks: tracks.data.tracks
                    }]
                } else {
                    setUnfoundArtist([...unfoundArtist, name])
                }
            }
            setPlaylist(artists)
            setSelectedTracks(artists.map(a => a.tracks.map(t => t.id)).flat())
        }

        fetchData()
    }, [])

    const generatedTracks = () => {
        return playlist.map(p => p.tracks.slice(0, slice)).flat().filter(t => selectedTracks.includes(t.id))
    }

    const onGenerate = (e) => {
        if (generating) return
        e.preventDefault()

        if (!playlistName || playlistName.length < 3) {
            alert('Le nom de la playlist est incorrect')
            return
        }

        setGenerating(true)
        const tracks = generatedTracks()

        axios.post(`https://api.spotify.com/v1/users/${user.id}/playlists`, {
            name: playlistName,
            description: "Dour Festival 2022 Playlist",
            public: false,
        }).then(async ({ data }) => {
            const playlistId = data.id

            // Split tracks ranges
            const pages = (Math.floor(tracks.length / 100) + 1)
            for (let i = 0; i < pages; i++) {
                const rangeTracks = tracks.slice(i * 100, (i * 100) + 100)
                await axios.post(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?uris=${rangeTracks.map(t => t.uri).join(',')}`)
            }

            window.open(data.uri);
        }).finally(() => {
            setGenerating(false)
        })
    }

    const toggleTrack = (id) => {
        if (selectedTracks.includes(id)) {
            setSelectedTracks(selectedTracks.filter(s => s !== id))
        } else {
            setSelectedTracks([...selectedTracks, id])
        }
    }

    const artistTracks = (artistId) => {
        const artist = playlist.find(p => p.infos.id === artistId)

        return artist.tracks.slice(0, slice)
    }

    const allArtistSelected = (artistId) => {
        return artistTracks(artistId).map(t => t.id).every(i => selectedTracks.includes(i))
    }

    const toggleArtist = (artistId) => {
        if (allArtistSelected(artistId)) {
            // console.log('On deselectionne', artistTracks(artistId).map(t => t.id));
            setSelectedTracks(selectedTracks.filter(id => !artistTracks(artistId).map(t => t.id).includes(id)))
        } else {
            console.log('NTM', );
            setSelectedTracks(uniq([...selectedTracks, ...artistTracks(artistId).map(t => t.id)]))
        }
    }

    if (loading || !user)
        return <h1>Chargement...</h1>

    return <div className="max-w-xl mx-auto mb-40">
        <div className="p-4 shadow-lg rounded-xl">
            <span className="text-xs font-semibold">Connecté en tant que</span>

            <div className="flex items-center justify-between">
                <div className="flex items-center mt-4">
                    {user.images[0] && <img src={`${user.images[0].url}`} className='rounded-full w-14 h-14' alt='profile' />}

                    <div className="flex flex-col ml-4">
                        <span className="text-sm font-semibold">{user.display_name}</span>
                        <span className="text-xs font-light">{user.email}</span>
                    </div>
                </div>

                {/* <button onClick={() => dispatch(setToken(null))} className="bg-spotify text-white px-4 py-2 font-semibold text-xs rounded-full hover:bg-opacity-80 transition-all">Déconnexion</button> */}
            </div>
        </div>

        <div className="mt-10">
            <span className="text-xs font-semibold">Nombre de sons</span>
            <div className="flex items-center space-x-2">
                <button className={`w-full transition-all text-xs font-semibold py-2 rounded-lg ${slice === 1 ? 'bg-spotify hover:bg-opacity-80 text-white' : 'bg-gray-100 hover:bg-gray-200'}`} onClick={() => setSlice(1)}>1</button>
                <button className={`w-full transition-all text-xs font-semibold py-2 rounded-lg ${slice === 2 ? 'bg-spotify hover:bg-opacity-80 text-white' : 'bg-gray-100 hover:bg-gray-200'}`} onClick={() => setSlice(2)}>2</button>
                <button className={`w-full transition-all text-xs font-semibold py-2 rounded-lg ${slice === 3 ? 'bg-spotify hover:bg-opacity-80 text-white' : 'bg-gray-100 hover:bg-gray-200'}`} onClick={() => setSlice(3)}>3</button>
                <button className={`w-full transition-all text-xs font-semibold py-2 rounded-lg ${slice === 4 ? 'bg-spotify hover:bg-opacity-80 text-white' : 'bg-gray-100 hover:bg-gray-200'}`} onClick={() => setSlice(4)}>4</button>
                <button className={`w-full transition-all text-xs font-semibold py-2 rounded-lg ${slice === 5 ? 'bg-spotify hover:bg-opacity-80 text-white' : 'bg-gray-100 hover:bg-gray-200'}`} onClick={() => setSlice(5)}>5</button>
                <button className={`w-full transition-all text-xs font-semibold py-2 rounded-lg ${slice === 6 ? 'bg-spotify hover:bg-opacity-80 text-white' : 'bg-gray-100 hover:bg-gray-200'}`} onClick={() => setSlice(6)}>6</button>
                <button className={`w-full transition-all text-xs font-semibold py-2 rounded-lg ${slice === 7 ? 'bg-spotify hover:bg-opacity-80 text-white' : 'bg-gray-100 hover:bg-gray-200'}`} onClick={() => setSlice(7)}>7</button>
                <button className={`w-full transition-all text-xs font-semibold py-2 rounded-lg ${slice === 8 ? 'bg-spotify hover:bg-opacity-80 text-white' : 'bg-gray-100 hover:bg-gray-200'}`} onClick={() => setSlice(8)}>8</button>
                <button className={`w-full transition-all text-xs font-semibold py-2 rounded-lg ${slice === 9 ? 'bg-spotify hover:bg-opacity-80 text-white' : 'bg-gray-100 hover:bg-gray-200'}`} onClick={() => setSlice(9)}>9</button>
                <button className={`w-full transition-all text-xs font-semibold py-2 rounded-lg ${slice === 10 ? 'bg-spotify hover:bg-opacity-80 text-white' : 'bg-gray-100 hover:bg-gray-200'}`} onClick={() => setSlice(10)}>10</button>
            </div>
        </div>

        <div className="bg-red-500 mt-10 p-2 rounded-lg text-white">
            <span className="font-semibold text-sm">Artiste.s non trouvé.s</span>

            <div>
                {unfoundArtist.map(a => <span>{a}</span>)}
            </div>
        </div>

        <div className="mt-10 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Playlist</h2>
            <span className="text-xs font-light hover:underline cursor-pointer">{true ? 'Tout séléctionner' : 'Tout séléctionner'}</span>
        </div>
        <div className="space-y-4">
            {playlist.map((p) => {
                const allSelected = allArtistSelected(p.infos.id)
                return <div key={p.infos.id} className="p-1 bg-white shadow-lg rounded-xl">
                    <div className="flex items-center bg-gray-100 rounded-lg px-4 py-2">
                        <div className="flex items-center flex-1">
                            <img src={p.infos.images[0].url} className='w-14 h-14 rounded-full mr-2' />

                            <div>
                                <span className="font-semibold">{p.infos.name}</span>

                                <div className="flex flex-wrap -mb-1 mt-2">
                                    {p.infos.genres.map(g => <span key={g} className="px-2 py-1 text-xs bg-gray-200 mr-1 rounded-md mb-1">{g}</span>)}
                                </div>
                            </div>
                        </div>

                        <div onClick={() => toggleArtist(p.infos.id)} className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer ${allSelected ? 'bg-spotify' : 'bg-white'}`}>
                            {allSelected && <i className="fi fi-br-check text-sm text-white"></i>}
                        </div>
                    </div>

                    <div className="mt-2 mb-4 px-2">
                        <span className="text-xs font-semibold">Tracklist</span>

                        <div className="mt-2 space-y-2">
                            {p.tracks.slice(0, slice).map((t) => {
                                const selected = selectedTracks.includes(t.id)
                                return <div onClick={() => toggleTrack(t.id)} key={t.id} className={`flex items-center justify-between px-4 py-2 rounded-lg cursor-pointer hover:bg-opacity-80 transition-all ${selected ? 'bg-spotify text-white' : 'hover:bg-gray-100'}`}>
                                    <div className="flex items-center">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 border-gray-200 ${selected ? 'bg-white' : ''}`}>
                                            {selected && <i className="fi fi-br-check text-sm text-spotify"></i>}
                                        </div>
                                        <a href={t.preview_url} target='_blank' className='hover:underline ml-2'>{t.name}</a>
                                    </div>
                                    <span>{prettyMilliseconds(t.duration_ms)}</span>
                                    {/* <span className="text-xs font-semibold px-4 py-1 bg-gray-100 rounded-lg">44</span> */}
                                </div>
                            })}
                        </div>
                    </div>
                </div>
            })}
        </div>

        <div className="fixed left-0 right-0 bottom-0 border-t bg-white">
            <form onSubmit={onGenerate} className="container mx-auto py-4 flex items-center justify-between max-w-xl">
                <input onChange={(e) => setPlaylistName(e.target.value)} className="border-2 border-gray-100 rounded-lg px-4 py-2 outline-none focus:border-spotify transition-all flex-1" placeholder="Nom de la playlist" />
                <button className={`flex items-center px-4 py-2 bg-spotify rounded-full text-white font-semibold text-sm ml-4 hover:bg-opacity-80 transition-all ${generating ? 'bg-opacity-50' : ''}`}>
                    <span>{generating ? 'Chargement' : 'Générer la playlist'}</span>
                    <span className="px-2 py-1 text-xs font-semibold bg-white text-spotify rounded-full ml-4 shadow">{generatedTracks().length}</span>
                </button>
            </form>
        </div>
    </div>
}