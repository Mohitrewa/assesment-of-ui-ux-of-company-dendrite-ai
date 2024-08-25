import React, { useState } from "react";
import { IconButton, Typography, Button } from "@mui/material";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import InviteFirend from "../InviteFriend"; // Ensure the path is correct
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import { signOut } from 'firebase/auth'; // Import signOut from Firebase Authentication
import { auth } from '../../utils/Firebase/firebaseConfig';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate(); // Initialize useNavigate hook

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleInviteClick = () => {
    setDialogOpen(true);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }; 


  return (
    <header className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-600 p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Typography variant="h6" component="div" className="text-white font-bold">
          <a href="/">WhiteBoard-PulseZest</a>
        </Typography>
        <nav className="hidden md:flex space-x-8">
         
          <Typography variant="body1" component="a" href="#" className="text-white pt-2 hover:text-gray-300">
            Contact
          </Typography>
          <Button
            onClick={handleLogout}
            color="inherit"
            variant="outlined"
            className="text-white border-white hover:bg-white hover:text-black"
          >
            Logout
          </Button>
        </nav>
        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            className="text-white focus:outline-none focus:ring-2"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden ${isOpen ? "block" : "hidden"}`}>
        <nav className="flex flex-col space-y-2 mt-4">
          <Typography variant="body1" component="a" href="#" className="text-white hover:text-gray-300 py-2 px-4">
            Home
          </Typography>
          <Typography variant="body1" component="a" href="#" className="text-white hover:text-gray-300 py-2 px-4">
            About
          </Typography>
          <Typography variant="body1" component="a" href="#" className="text-white hover:text-gray-300 py-2 px-4">
            Services
          </Typography>
          <Typography variant="body1" component="a" href="#" className="text-white hover:text-gray-300 py-2 px-4">
            Contact
          </Typography>
        </nav>
      </div>

      
    </header>
  );
};

export default Navbar;
