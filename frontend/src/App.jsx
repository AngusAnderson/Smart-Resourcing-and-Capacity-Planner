import useToggle from './functions/useToggle';
import Header from './Components/Header';
import Sidebar from './Components/Sidebar';
// import Big_Calendar from './Components/Big_Calendar';
import Calendar from './Components/Calendar'


function App() {

  // From useToggle.js
  const [isVisible, toggleVisibility] = useToggle(false);

  return (
    <>
      {/* Header Section */}
      <Header isVisible={isVisible} toggleVisibility={toggleVisibility}/>

      

      <div className="main">
        {/* Sidebar Section */}
        <Sidebar />
        
        {/* Main Calendar Section */}
        <Calendar />
        
      </div>

      
    </>



  )
}

export default App
