import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../styles/traveldiary.css'; // Ensure this CSS file is updated for enhanced UI
import { jwtDecode } from "jwt-decode";

const TravelersDiary = () => {
  const [activePanel, setActivePanel] = useState('create');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [diaries, setDiaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentDiaryId, setCurrentDiaryId] = useState(null);
  const fileInputRef = useRef(null);

  const storedToken = localStorage.getItem('access_token');
  const decodedToken = storedToken ? jwtDecode(storedToken) : null;
  const currentUserId = decodedToken ? decodedToken.user_id : null;

  useEffect(() => {
    const fetchDiaries = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://127.0.0.1:8000/diary/diaries/');
        setDiaries(response.data);
      } catch (err) {
        setError('Failed to fetch diaries. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchDiaries();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
  
    // Only append the image if a new file is selected
    if (isUpdating && image instanceof File) {
      formData.append('image', image);
    } else if (!isUpdating && image) {
      formData.append('image', image);
    }
  
    try {
      if (isUpdating) {
        const response = await axios.patch(
          `http://127.0.0.1:8000/diary/diaries/${currentDiaryId}/`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${localStorage.getItem('access_token')}`,
            },
          }
        );
  
        setDiaries(diaries.map((diary) => (diary.id === currentDiaryId ? response.data : diary)));
        alert('Diary updated successfully!');
      } else {
        const response = await axios.post('http://127.0.0.1:8000/diary/diaries/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        });
        setDiaries([...diaries, response.data]);
        alert('Diary created successfully!');
      }
  
      setTitle('');
      setDescription('');
      setImage(null);
      setIsUpdating(false);
      setCurrentDiaryId(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setError('Failed to submit diary. Please try again later.');
    }
  };
  
  const handleEdit = (diary) => {
    setActivePanel('create');
    setTitle(diary.title);
    setDescription(diary.description);
    setImage(diary.image); // Preserve the image URL
    setIsUpdating(true);
    setCurrentDiaryId(diary.id);
  };

  const handleDelete = async (diaryId) => {
    if (window.confirm('Are you sure you want to delete this diary?')) {
      try {
        await axios.delete(`http://127.0.0.1:8000/diary/diaries/${diaryId}/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        });
        setDiaries(diaries.filter((diary) => diary.id !== diaryId));
        alert('Diary deleted successfully!');
      } catch (err) {
        setError('Failed to delete diary. Please try again later.');
      }
    }
  };

  const renderCreatePanel = () => (
    <div className="panel">
      <h2>{isUpdating ? 'Edit Diary Entry' : 'Create a New Diary Entry'}</h2>
      <form onSubmit={handleSubmit} className="enhanced-form">
        <div className="form-group">
          <label htmlFor="title">Diary Title</label>
          <input
            type="text"
            id="title"
            placeholder="Enter a descriptive title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            placeholder="Write your story here..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="form-control"
          ></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="image">Upload Image</label>
          <input
            type="file"
            id="image"
            onChange={(e) => setImage(e.target.files[0])}
            accept="image/*"
            ref={fileInputRef}
            className="form-control file-input"
          />
        </div>
        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? 'Publishing...' : isUpdating ? 'Update' : 'Publish'}
        </button>
      </form>
      {error && <p className="error-message">{error}</p>}
    </div>
  );

  const renderViewPanel = () => (
    <div className="panel">
      <h2>Travel Diaries</h2>
      {loading ? (
        <p>Loading diaries...</p>
      ) : diaries.length > 0 ? (
        <div className="diary-card-container">
          {diaries.map((diary) => (
            <div key={diary.id} className="diary-card">
              {diary.image && <img src={diary.image} alt={diary.title} className="diary-image" />}
              <h3>{diary.title}</h3>
              <p>{diary.description}</p>
              <p className="diary-author">Author: {diary.author_email}</p>
              {currentUserId === diary.author && (
                <div className="diary-actions">
                  <button className="edit-btn" onClick={() => handleEdit(diary)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDelete(diary.id)}>Delete</button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>No diaries available. Be the first to share your story!</p>
      )}
    </div>
  ); 

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <button
          className={activePanel === 'create' ? 'active' : ''}
          onClick={() => setActivePanel('create')}
        >
          {isUpdating ? 'Editing...' : 'Create Diary'}
        </button>
        <button
          className={activePanel === 'view' ? 'active' : ''}
          onClick={() => setActivePanel('view')}
        >
          View Diaries
        </button>
      </aside>
      <main className="content">
        {activePanel === 'create' ? renderCreatePanel() : renderViewPanel()}
      </main>
    </div>
    );
  };
  
  export default TravelersDiary;