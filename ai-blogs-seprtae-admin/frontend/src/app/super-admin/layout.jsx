import { assets } from "@/Assets/assets";
import Sidebar from "@/Components/AdminComponents/newSidebar";
import Image from "next/image";
import { ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AppProvider } from "@/context/AppContext"; // <-- import your provider
import Navbar from "@/Components/Navbar";
import PrivateComponent from "@/Components/privateComponent";
export default function Layout({ children }) {
    return (
      <PrivateComponent>
        <AppProvider> {/* <-- wrap everything with AppProvider */}
          <div className="flex flex-col min-h-screen w-full bg-gray-50 overflow-x-hidden">
            {/* Navbar - Full Width */}
            <div className="fixed top-0 left-0 right-0 z-50 w-full">
              <Navbar />
            </div>
            
            {/* Content Area with Sidebar */}
            <div className="flex flex-1 relative pt-[73px]">
              {/* Sidebar Component */}
              <Sidebar />
              
              {/* Main Content - Responsive margin for sidebar */}
              <div className="flex-1 lg:ml-64 w-full min-h-[calc(100vh-73px)] overflow-x-hidden">
                <div className="container mx-auto max-w-7xl px-6 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10">
                  {children}
                </div>
              </div>
            </div>
          </div>
        </AppProvider>
      </PrivateComponent>
    )
}
