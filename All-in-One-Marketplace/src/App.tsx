// import React, { useState } from 'react';
// import { Header } from './components/Header';
// import { HomePage } from './pages/HomePage';
// import { MarketplacePage } from './pages/MarketplacePage';
// import { SecondhandPage } from './pages/SecondhandPage';
// import { JobsPage } from './pages/JobsPage';
// import { TravelPage } from './pages/TravelPage';

// function App() {
//   const [activeCategory, setActiveCategory] = useState('home');

//   const renderPage = () => {
//     switch (activeCategory) {
//       case 'home':
//         return <HomePage onCategoryChange={setActiveCategory} />;
//       case 'marketplace':
//         return <MarketplacePage />;
//       case 'secondhand':
//         return <SecondhandPage />;
//       case 'jobs':
//         return <JobsPage />;
//       case 'travel':
//         return <TravelPage />;
//       default:
//         return <HomePage onCategoryChange={setActiveCategory} />;
//     }
//   };

//   return (
//     <div className="min-h-screen bg-background">
//       <Header 
//         activeCategory={activeCategory} 
//         onCategoryChange={setActiveCategory} 
//       />
//       <main>
//         {renderPage()}
//       </main>
      
//       {/* Footer */}
//       <footer className="bg-muted/30 border-t mt-20">
//         <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
//             <div className="col-span-1 md:col-span-2">
//               <div className="text-2xl font-bold text-gradient mb-4">MarketHub</div>
//               <p className="text-muted-foreground mb-4 max-w-md">
//                 Your all-in-one platform for buying, selling, working, and traveling. 
//                 Connect with millions of users worldwide.
//               </p>
//               <div className="flex space-x-4">
//                 <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
//                   Twitter
//                 </a>
//                 <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
//                   Facebook
//                 </a>
//                 <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
//                   Instagram
//                 </a>
//                 <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
//                   LinkedIn
//                 </a>
//               </div>
//             </div>
            
//             <div>
//               <h3 className="font-semibold mb-4">Categories</h3>
//               <ul className="space-y-2 text-sm text-muted-foreground">
//                 <li><a href="#" className="hover:text-primary transition-colors">Marketplace</a></li>
//                 <li><a href="#" className="hover:text-primary transition-colors">Second-hand</a></li>
//                 <li><a href="#" className="hover:text-primary transition-colors">Jobs</a></li>
//                 <li><a href="#" className="hover:text-primary transition-colors">Travel</a></li>
//               </ul>
//             </div>
            
//             <div>
//               <h3 className="font-semibold mb-4">Support</h3>
//               <ul className="space-y-2 text-sm text-muted-foreground">
//                 <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
//                 <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
//                 <li><a href="#" className="hover:text-primary transition-colors">Safety</a></li>
//                 <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
//                 <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
//               </ul>
//             </div>
//           </div>
          
//           <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
//             <p>&copy; 2024 MarketHub. All rights reserved. Built with ❤️ for the community.</p>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// }

// export default App;

// src/App.jsx

import React, { useState } from 'react';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { MarketplacePage } from './pages/MarketplacePage';
import { SecondhandPage } from './pages/SecondhandPage';
import { JobsPage } from './pages/JobsPage';
import { TravelPage } from './pages/TravelPage';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { useUser } from '@clerk/clerk-react';

function App() {
  const [activeCategory, setActiveCategory] = useState('home');
  const { isSignedIn } = useUser();
  if (isSignedIn && activeCategory === 'login') {
    setActiveCategory('home');
  }

  const renderPage = () => {
    switch (activeCategory) {
      case 'home':
        return <HomePage onCategoryChange={setActiveCategory} />;
      case 'marketplace':
        return <MarketplacePage />;
      case 'secondhand':
        return <SecondhandPage />;
      case 'jobs':
        return <JobsPage />;
      case 'travel':
        return <TravelPage />;
      case 'login':
        return <LoginPage />;
      case 'signup':
        return <SignUpPage />;
      default:
        return <HomePage onCategoryChange={setActiveCategory} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        activeCategory={activeCategory} 
        onCategoryChange={setActiveCategory} 
      />
      <main>
        {renderPage()}
      </main>
      
      {/* Footer */}
      <footer className="bg-muted/30 border-t mt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="text-2xl font-bold text-gradient mb-4">MarketHub</div>
              <p className="text-muted-foreground mb-4 max-w-md">
                Your all-in-one platform for buying, selling, working, and traveling. 
                Connect with millions of users worldwide.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Twitter
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Facebook
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Instagram
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  LinkedIn
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Categories</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Marketplace</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Second-hand</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Jobs</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Travel</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Safety</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 MarketHub. All rights reserved. Built with ❤️ for the community.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;