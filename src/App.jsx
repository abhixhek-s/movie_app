import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import Search from './components/Search'
import MovieCard from './components/MovieCard'
import { useDebounce } from 'react-use'
import { getTrendingMovies, updateSearchCount } from './appwrite'

const API_BASE_URL='https://api.themoviedb.org/3/'
const API_KEY=import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS={
  method:'GET',
  headers:{
    accept:'application/json',
    Authorization:`Bearer ${API_KEY}`
  }
}
function App() {
const[searchTerm,setSearchTerm]=useState('');
const [movies, setMovies] = useState([])
const [trending, setTrending] = useState([])
const [isLoading, setIsLoading] = useState(false)
const [errorMessage, setErrorMessage] = useState('')
const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

useDebounce(()=>setDebouncedSearchTerm(searchTerm),500,[searchTerm])


async function fetchMovies(query=''){
  setIsLoading(true);
  try{
const endpoint= query?
`${API_BASE_URL}search/movie?query=${encodeURIComponent(query)}`
:
`${API_BASE_URL}discover/movie?sort_by=popularity.desc`
const response=await fetch(endpoint,API_OPTIONS)
const data=await response.json();
setMovies(data.results)

if(query && data.results.length>0){
  await updateSearchCount(query,data.results[0]);
}
  }
  catch(error){
    console.error(error)
    setErrorMessage('Error fetching movies')
 
  }
  finally{
    setIsLoading(false)
  }
}

async function getTrending(){
  try{

    const res=await getTrendingMovies();
    setTrending(res);
  }
  catch(error){
    console.log(error)
  }
}
useEffect(()=>{
  fetchMovies(debouncedSearchTerm);
},[debouncedSearchTerm])

useEffect(()=>{
  getTrending()
},[])

  return (
    <>
      <main>
        <div className='pattern'/>
        <div className='wrapper'>
          <header>
            <img src='./hero-img.png' alt='Hero Banner'/>
            <h1>
              Find <span className='text-gradient'>Movies</span> You'll Enjoy Without the Hassle
            </h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
          </header>
         {trending.length >0 && <section className='trending'>
<h2>Teending Movies</h2>
<ul>
  {trending.map((movie,index)=>
  (
    <li key={movie.$id}>
<p>{index+1}</p>
<img src={movie.poster_url} alt={movie.title}/>
    </li>
  ))}
</ul>
          </section>}



          <section className='all-movies'>
            <h2 className='mt-10'>All Movies</h2>
            {isLoading?(
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>


            ):errorMessage ?(
              <p className='text-white font-bold'>{errorMessage}</p>

            ):(
              <ul>
                {movies.map((movie)=>(

               <MovieCard key={movie.id} movie={movie}/>
                ))}
              </ul>
            )

            }

          </section>
        </div>
        
        </main> 
        
           </>
  )
}

export default App
