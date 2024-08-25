import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Chip,
  Card,
  CardContent,
} from "@mui/material";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";

interface InviteFriendsProps {
  open: boolean;
  onClose: () => void;
  Socket: string;  
}

const InviteFriends: React.FC<InviteFriendsProps> = ({ open, onClose, Socket }) => {
  const [email, setEmail] = useState("");
  const [emails, setEmails] = useState<string[]>([]);
  const {userId} = useParams<{userId: string}>();
  const [emailError, setEmailError] = useState<string>("");
  const [emailCheckError, setEmailCheckError] = useState<string>("");
  const [registeredEmails, setRegisteredEmails] = useState<Set<string>>(new Set());
  const [currentUserUID, setCurrentUserUID] = useState<string | null>(null);

  const db = getFirestore();
 

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const emailSet = new Set<string>();
        querySnapshot.forEach((doc) => {
          const userData = doc.data();
          if (userData.email) {
            emailSet.add(userData.email);
          }
        });
        setRegisteredEmails(emailSet);
      } catch (error) {
        console.error("Error fetching emails from Firestore:", error);
      }
    };

    
    console.log(Socket)
    fetchEmails();
 
  }, [db]);

  const handleSend = async () => {
    if (!userId) {
      console.error("User UID is not available.");
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/send-invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emails, Socket }),
      });

      if (response.ok) {
        console.log("Emails sent successfully");
        setEmails([]);
      } else {
        console.error("Failed to send emails");
      }
    } catch (error) {
      console.error("Error sending emails:", error);
    }

    onClose();
  };

  const handleDeleteEmail = (emailToDelete: string) => {
    setEmails(emails.filter((email) => email !== emailToDelete));
  };

  const validateEmail = (email: string) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const handleAddEmail = () => {
    if (!validateEmail(email)) {
      setEmailError("Invalid email address.");
      return;
    }

    setEmailError("");
    setEmailCheckError("");

    if (registeredEmails.has(email)) {
      if (!emails.includes(email)) {
        setEmails([...emails, email]);
      }
      setEmail(""); // Clear input field after adding
    } else {
      setEmailCheckError("Email is not registered.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle className="bg-gray-100">
        <Typography variant="h6" className="text-gray-800">Invite a Friend</Typography>
      </DialogTitle>
      <DialogContent className="p-4">
        <Typography variant="subtitle1" className="text-gray-600 mb-4">
          Enter your friend's email addresses to send invitations.
        </Typography>
        <TextField
          autoFocus
          margin="dense"
          label="Email Address"
          type="email"
          fullWidth
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={!!emailError || !!emailCheckError}
          helperText={emailError || emailCheckError}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddEmail();
            }
          }}
          className="mb-4"
        />
        <div className="mt-4">
          <Card variant="outlined" className="border-gray-300">
            <CardContent className="p-4">
              <Typography variant="subtitle2" className="text-gray-800">Entered Emails:</Typography>
              <div className="flex flex-wrap gap-2 mt-2">
                {emails.map((email, index) => (
                  <Chip
                    key={index}
                    label={email}
                    onDelete={() => handleDeleteEmail(email)}
                    className="bg-blue-100 text-blue-800"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
      <DialogActions className="bg-gray-100 p-4">
        <Button onClick={onClose} color="primary" className="text-blue-500 hover:bg-blue-100">
          Cancel
        </Button>
        <Button
          onClick={handleSend}
          color="primary"
          disabled={emails.length === 0}
          className="bg-blue-500 text-white hover:bg-blue-600"
        >
          Send
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InviteFriends;