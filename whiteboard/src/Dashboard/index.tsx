import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { useNavigate, useParams } from 'react-router-dom';
import { getAuth,  } from 'firebase/auth';
import { getFirestore, collection, setDoc, updateDoc, deleteDoc, doc, query, onSnapshot, getDocs } from 'firebase/firestore';
import Swal from 'sweetalert2';  

import Navbar from '../Components/Navbar/navbar';

interface Whiteboard {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function Dashboard() {
  const [whiteboards, setWhiteboards] = useState<Whiteboard[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRefs = useRef<{ [key: string]: HTMLDivElement | null }>({}); // Track refs for each menu
  const navigate = useNavigate();
  const auth = getAuth();
  const db = getFirestore();
  const { userId } = useParams<{ userId: string }>();

  useEffect(() => {
    const user = auth.currentUser;
    if (user && user.uid === userId) {
      const whiteboardsRef = collection(db, 'users', user.uid, 'whiteboards');
      const q = query(whiteboardsRef);

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const whiteboardsData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date()
          };
        }) as Whiteboard[];

        // Sort whiteboards by createdAt in descending order
        whiteboardsData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        setWhiteboards(whiteboardsData);
      });

      return () => unsubscribe();
    } else {
      navigate('/login');
    }
  }, [auth.currentUser, db, userId, navigate]);

  const createNewWhiteboard = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const whiteboardsRef = collection(db, 'users', user.uid, 'whiteboards');
        const q = query(whiteboardsRef);
        const snapshot = await getDocs(q);

        const existingIds = snapshot.docs.map(doc => doc.id);
        const highestNumber = existingIds.reduce((max, id) => {
          const match = id.match(/^canvas-(\d+)$/);
          if (match) {
            const number = parseInt(match[1], 10);
            return Math.max(max, number);
          }
          return max;
        }, 0);

        const newId = `canvas-${(highestNumber + 1).toString().padStart(2, '0')}`;
        const { value: name } = await Swal.fire({
          title: 'Enter the name of the new whiteboard:',
          input: 'text',
          inputPlaceholder: 'Whiteboard name',
          showCancelButton: true,
          confirmButtonText: 'Create',
          cancelButtonText: 'Cancel'
        });

        if (name) {
          const whiteboardDocRef = doc(whiteboardsRef, newId);
          await setDoc(whiteboardDocRef, {
            name,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          navigate(`/dashboard/${user.uid}/${newId}`);
        }
      } catch (error) {
        console.error('Error creating whiteboard:', error);
      }
    }
  };

  const renameWhiteboard = async (id: string, currentName: string) => {
    const { value: newName } = await Swal.fire({
      title: 'Enter new name:',
      input: 'text',
      inputValue: currentName,
      showCancelButton: true,
      confirmButtonText: 'Rename',
      cancelButtonText: 'Cancel'
    });

    if (newName) {
      try {
        const whiteboardRef = doc(db, 'users', userId!, 'whiteboards', id);
        await updateDoc(whiteboardRef, {
          name: newName,
          updatedAt: new Date(),
        });
        setOpenMenuId(null);
      } catch (error) {
        console.error('Error renaming whiteboard:', error);
      }
    }
  };

  const deleteWhiteboard = async (id: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!'
    });

    if (result.isConfirmed) {
      try {
        const whiteboardRef = doc(db, 'users', userId!, 'whiteboards', id);
        await deleteDoc(whiteboardRef);
        setOpenMenuId(null);
        Swal.fire('Deleted!', 'The whiteboard has been deleted.', 'success');
      } catch (error) {
        console.error('Error deleting whiteboard:', error);
        Swal.fire('Error!', 'There was an error deleting the whiteboard.', 'error');
      }
    }
  };

  const toggleMenu = (id: string) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId && menuRefs.current[openMenuId] && !(event.target instanceof Node && menuRefs.current[openMenuId]?.contains(event.target))) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

  return (
    <div>
      <Navbar/>
      <div className="flex flex-wrap gap-6 p-6 justify-center bg-white min-h-screen">
        <div
          className="relative border-2 border-dashed border-gray-300 p-4 w-64 h-40 flex justify-center items-center cursor-pointer shadow-lg rounded-lg bg-gradient-to-r from-teal-400 to-blue-500 text-white hover:shadow-xl transition-shadow"
          onClick={createNewWhiteboard}
        >
          <h3 className="text-xl font-semibold">+ Create New Whiteboard</h3>
        </div>

        {whiteboards.map((whiteboard) => (
          <div
            key={whiteboard.id}
            className="relative w-64 h-40 rounded-lg overflow-hidden transition-transform duration-300 ease-in-out transform hover:scale-105"
            style={{
              boxShadow: `
                0 0 5px rgba(255, 0, 255, 0.2),
                0 0 10px rgba(255, 0, 255, 0.2),
                0 0 20px rgba(255, 0, 255, 0.2),
                0 0 40px rgba(255, 0, 255, 0.2),
                0 0 80px rgba(255, 0, 255, 0.2)
              `,
            }}
          >
            <div className="absolute inset-0 rounded-lg border-4" style={{ borderColor: 'transparent' }}></div>
            <div
              className="relative z-10 flex flex-col justify-end h-full p-4 bg-white shadow-md rounded-lg cursor-pointer"
              onClick={() => navigate(`/dashboard/${userId}/${whiteboard.id}`)}
            >
              <h3 className="text-lg font-semibold text-gray-800">{whiteboard.name}</h3>
              <p className="text-sm text-gray-700">
                Created At: {format(new Date(whiteboard.createdAt), 'yyyy-MM-dd')}
              </p>
              <div className="absolute top-2 right-2" ref={el => menuRefs.current[whiteboard.id] = el}>
                <button
                  className="text-gray-700 hover:text-gray-900 focus:outline-none transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMenu(whiteboard.id);
                  }}
                >
                  <span className="text-xl">&#x22EE;</span>
                </button>
                {openMenuId === whiteboard.id && (
                  <div className="absolute right-0 top-8 mt-2 w-40 bg-white shadow-lg rounded-md z-20 ring-1 ring-gray-900/5">
                    <ul className="py-1 text-gray-700">
                      <li
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          renameWhiteboard(whiteboard.id, whiteboard.name);
                        }}
                      >
                        <span className="mr-2">✏️</span> Rename
                      </li>
                      <li
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteWhiteboard(whiteboard.id);
                        }}
                      >
                        <span className="mr-2">🗑️</span> Delete
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
