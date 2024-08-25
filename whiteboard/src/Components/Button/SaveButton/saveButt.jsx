import React, { useCallback } from 'react';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import Swal from 'sweetalert2'; // Import SweetAlert2

const SaveButton = ({ canvasId, elements, setElements }) => {
    const loadCanvasData = useCallback(async () => {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user && canvasId) {
            const db = getFirestore();
            const canvasDocRef = doc(db, 'users', user.uid, 'whiteboards', canvasId, 'saveData', canvasId);
            try {
                const canvasDoc = await getDoc(canvasDocRef);
                if (canvasDoc.exists()) {
                    const data = canvasDoc.data();
                    setElements(data?.elements || []);
                } else {
                    console.error('No such document!');
                }
            } catch (error) {
                console.error('Error fetching canvas data:', error);
            }
        } else {
            console.error('User is not authenticated or canvasId is missing.');
        }
    }, [canvasId, setElements]);

    React.useEffect(() => {
        loadCanvasData();
    }, [loadCanvasData]);

    const captureAndUploadPreview = async () => {
        const canvas = document.getElementById(canvasId); 
        if (canvas) {
            const dataUrl = canvas.toDataURL(); // Get canvas image as data URL
            const storage = getStorage();
            const storageRef = ref(storage, `previews/${canvasId}.png`);
            try {
                await uploadString(storageRef, dataUrl, 'data_url');
                const downloadURL = await getDownloadURL(storageRef);
                return downloadURL;
            } catch (error) {
                console.error('Error uploading image:', error);
                return null;
            }
        } else {
            console.error('Canvas element not found.');
            return null;
        }
    };

    const saveCanvasData = async () => {
        const auth = getAuth();
        const user = auth.currentUser;
        if (user && canvasId) {
            const db = getFirestore();
            const canvasDocRef = doc(db, 'users', user.uid, 'whiteboards', canvasId, 'saveData', canvasId);

            // Show a confirmation dialog before saving
            const result = await Swal.fire({
                title: 'Save Changes?',
                text: 'Do you want to save the current canvas data?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Save',
                cancelButtonText: 'Cancel'
            });

            if (result.isConfirmed) {
                try {
                    // Capture and upload the preview image
                    const previewUrl = await captureAndUploadPreview();

                    // Save elements and preview URL
                    await setDoc(canvasDocRef, { elements, previewUrl });
                    Swal.fire('Saved!', 'Your changes have been saved.', 'success');
                } catch (error) {
                    console.error('Error saving canvas data:', error);
                    Swal.fire('Error!', 'There was an error saving your data.', 'error');
                }
            }
        } else {
            console.error('User is not authenticated or canvasId is missing.');
        }
    };

    return (
        <div className="fixed top-4 left-4 z-50">
            <button
                className="bg-green-500 text-white font-semibold py-2 px-4 rounded shadow-md hover:bg-green-600 transition ease-in-out duration-300"
                onClick={saveCanvasData}
            >
                Save Now
            </button>
        </div>
    );
}

export default SaveButton;
