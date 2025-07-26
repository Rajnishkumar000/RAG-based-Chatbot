
// import React, { useState, useEffect } from 'react';
// import { Upload, FileText, Search, User, LogOut, Plus, Trash2, Eye, MessageCircle } from 'lucide-react';

// const API_BASE_URL = 'http://localhost:8000/api/v1';

// const App = () => {
//   const [user, setUser] = useState(null);
//   const [documents, setDocuments] = useState([]);
//   const [currentView, setCurrentView] = useState('documents');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   // Authentication state
//   const [authMode, setAuthMode] = useState('login');
//   const [authData, setAuthData] = useState({
//     username: '',
//     email: '',
//     password: '',
//     confirmPassword: ''
//   });

//   // Document creation/upload state
//   const [newDocument, setNewDocument] = useState({
//     title: '',
//     content: ''
//   });
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [uploadTitle, setUploadTitle] = useState('');

//   // Query state
//   const [query, setQuery] = useState('');
//   const [queryResults, setQueryResults] = useState(null);
//   const [searchResults, setSearchResults] = useState([]);

//   // Document view state
//   const [selectedDocument, setSelectedDocument] = useState(null);

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       fetchUserProfile(token);
//     }
//   }, []);

//   useEffect(() => {
//     if (user) {
//       fetchDocuments();
//     }
//   }, [user]);

//   const apiCall = async (endpoint, options = {}) => {
//     const token = localStorage.getItem('token');
//     const headers = {
//       'Content-Type': 'application/json',
//       ...(token && { Authorization: `Bearer ${token}` }),
//       ...options.headers
//     };

//     const response = await fetch(`${API_BASE_URL}${endpoint}`, {
//       ...options,
//       headers
//     });

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({}));
//       throw new Error(errorData.detail || `HTTP ${response.status}`);
//     }

//     return response.json();
//   };

//   const fetchUserProfile = async (token) => {
//     try {
//       const userData = await apiCall('/auth/me');
//       setUser(userData);
//     } catch (err) {
//       localStorage.removeItem('token');
//     }
//   };

//   const handleAuth = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     try {
//       if (authMode === 'register') {
//         if (authData.password !== authData.confirmPassword) {
//           throw new Error('Passwords do not match');
//         }
//         await apiCall('/auth/register', {
//           method: 'POST',
//           body: JSON.stringify({
//             username: authData.username,
//             email: authData.email,
//             password: authData.password
//           })
//         });
//         setSuccess('Registration successful! Please login.');
//         setAuthMode('login');
//       } else {
//         const formData = new FormData();
//         formData.append('username', authData.username);
//         formData.append('password', authData.password);

//         const response = await fetch(`${API_BASE_URL}/auth/login`, {
//           method: 'POST',
//           body: formData
//         });

//         if (!response.ok) {
//           const errorData = await response.json();
//           throw new Error(errorData.detail || 'Login failed');
//         }

//         const tokenData = await response.json();
//         localStorage.setItem('token', tokenData.access_token);
//         await fetchUserProfile(tokenData.access_token);
//       }
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     setUser(null);
//     setDocuments([]);
//     setCurrentView('documents');
//   };

//   const fetchDocuments = async () => {
//     try {
//       const docs = await apiCall('/documents/');
//       setDocuments(docs);
//     } catch (err) {
//       setError('Failed to fetch documents');
//     }
//   };

//   const createDocument = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     try {
//       await apiCall('/documents/', {
//         method: 'POST',
//         body: JSON.stringify(newDocument)
//       });
//       setSuccess('Document created successfully!');
//       setNewDocument({ title: '', content: '' });
//       await fetchDocuments();
//       setCurrentView('documents');
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const uploadDocument = async (e) => {
//     e.preventDefault();
//     if (!selectedFile || !uploadTitle) {
//       setError('Please provide both title and file');
//       return;
//     }

//     setLoading(true);
//     setError('');

//     try {
//       const formData = new FormData();
//       formData.append('title', uploadTitle);
//       formData.append('file', selectedFile);

//       const response = await fetch(`${API_BASE_URL}/documents/upload`, {
//         method: 'POST',
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem('token')}`
//         },
//         body: formData
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.detail || 'Upload failed');
//       }

//       setSuccess('Document uploaded successfully!');
//       setSelectedFile(null);
//       setUploadTitle('');
//       await fetchDocuments();
//       setCurrentView('documents');
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const deleteDocument = async (docId) => {
//     if (!window.confirm('Are you sure you want to delete this document?')) {
//       return;
//     }

//     try {
//       await apiCall(`/documents/${docId}`, { method: 'DELETE' });
//       setSuccess('Document deleted successfully!');
//       await fetchDocuments();
//     } catch (err) {
//       setError(err.message);
//     }
//   };

//   const viewDocument = async (docId) => {
//     try {
//       const doc = await apiCall(`/documents/${docId}`);
//       setSelectedDocument(doc);
//       setCurrentView('documentView');
//     } catch (err) {
//       setError('Failed to fetch document');
//     }
//   };

//   const handleQuery = async (e) => {
//     e.preventDefault();
//     if (!query.trim()) return;

//     setLoading(true);
//     setError('');

//     try {
//       const result = await apiCall('/query/', {
//         method: 'POST',
//         body: JSON.stringify({ query, top_k: 5 })
//       });
//       setQueryResults(result);
//       setCurrentView('queryResults');
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSearch = async (e) => {
//     e.preventDefault();
//     if (!query.trim()) return;

//     setLoading(true);
//     setError('');

//     try {
//       const results = await apiCall('/query/search', {
//         method: 'POST',
//         body: JSON.stringify({ query, top_k: 10 })
//       });
//       setSearchResults(results);
//       setCurrentView('searchResults');
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const clearMessages = () => {
//     setError('');
//     setSuccess('');
//   };

//   if (!user) {
//     return (
//       <div style={styles.container}>
//         <div style={styles.authContainer}>
//           <div style={styles.authHeader}>
//             <h1 style={styles.title}>RAG Document System</h1>
//             <p style={styles.subtitle}>
//               {authMode === 'login' ? 'Sign in to your account' : 'Create a new account'}
//             </p>
//           </div>

//           <form onSubmit={handleAuth} style={styles.authForm}>
//             <div style={styles.inputGroup}>
//               <label style={styles.label}>Username</label>
//               <input
//                 type="text"
//                 value={authData.username}
//                 onChange={(e) => setAuthData({...authData, username: e.target.value})}
//                 style={styles.input}
//                 required
//               />
//             </div>

//             {authMode === 'register' && (
//               <div style={styles.inputGroup}>
//                 <label style={styles.label}>Email</label>
//                 <input
//                   type="email"
//                   value={authData.email}
//                   onChange={(e) => setAuthData({...authData, email: e.target.value})}
//                   style={styles.input}
//                   required
//                 />
//               </div>
//             )}

//             <div style={styles.inputGroup}>
//               <label style={styles.label}>Password</label>
//               <input
//                 type="password"
//                 value={authData.password}
//                 onChange={(e) => setAuthData({...authData, password: e.target.value})}
//                 style={styles.input}
//                 required
//               />
//             </div>

//             {authMode === 'register' && (
//               <div style={styles.inputGroup}>
//                 <label style={styles.label}>Confirm Password</label>
//                 <input
//                   type="password"
//                   value={authData.confirmPassword}
//                   onChange={(e) => setAuthData({...authData, confirmPassword: e.target.value})}
//                   style={styles.input}
//                   required
//                 />
//               </div>
//             )}

//             {error && <div style={styles.error}>{error}</div>}
//             {success && <div style={styles.success}>{success}</div>}

//             <button type="submit" style={styles.authButton} disabled={loading}>
//               {loading ? 'Please wait...' : (authMode === 'login' ? 'Sign In' : 'Sign Up')}
//             </button>

//             <div style={styles.authSwitch}>
//               {authMode === 'login' ? (
//                 <>
//                   Don't have an account?{' '}
//                   <button
//                     type="button"
//                     onClick={() => {setAuthMode('register'); clearMessages();}}
//                     style={styles.linkButton}
//                   >
//                     Sign up
//                   </button>
//                 </>
//               ) : (
//                 <>
//                   Already have an account?{' '}
//                   <button
//                     type="button"
//                     onClick={() => {setAuthMode('login'); clearMessages();}}
//                     style={styles.linkButton}
//                   >
//                     Sign in
//                   </button>
//                 </>
//               )}
//             </div>
//           </form>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div style={styles.container}>
//       {/* Header */}
//       <header style={styles.header}>
//         <div style={styles.headerContent}>
//           <h1 style={styles.headerTitle}>RAG Document System</h1>
//           <div style={styles.headerRight}>
//             <span style={styles.userName}>
//               <User size={16} /> {user.username}
//             </span>
//             <button onClick={handleLogout} style={styles.logoutButton}>
//               <LogOut size={16} />
//             </button>
//           </div>
//         </div>
//       </header>

//       <div style={styles.mainLayout}>
//         {/* Sidebar */}
//         <nav style={styles.sidebar}>
//           <button
//             onClick={() => setCurrentView('documents')}
//             style={{
//               ...styles.navButton,
//               ...(currentView === 'documents' ? styles.navButtonActive : {})
//             }}
//           >
//             <FileText size={18} />
//             Documents
//           </button>
//           <button
//             onClick={() => setCurrentView('upload')}
//             style={{
//               ...styles.navButton,
//               ...(currentView === 'upload' ? styles.navButtonActive : {})
//             }}
//           >
//             <Upload size={18} />
//             Upload
//           </button>
//           <button
//             onClick={() => setCurrentView('create')}
//             style={{
//               ...styles.navButton,
//               ...(currentView === 'create' ? styles.navButtonActive : {})
//             }}
//           >
//             <Plus size={18} />
//             Create
//           </button>
//           <button
//             onClick={() => setCurrentView('query')}
//             style={{
//               ...styles.navButton,
//               ...(currentView === 'query' ? styles.navButtonActive : {})
//             }}
//           >
//             <MessageCircle size={18} />
//             Query
//           </button>
//         </nav>

//         {/* Main Content */}
//         <main style={styles.mainContent}>
//           {error && (
//             <div style={styles.notification}>
//               <div style={styles.error}>
//                 {error}
//                 <button onClick={clearMessages} style={styles.closeButton}>×</button>
//               </div>
//             </div>
//           )}

//           {success && (
//             <div style={styles.notification}>
//               <div style={styles.success}>
//                 {success}
//                 <button onClick={clearMessages} style={styles.closeButton}>×</button>
//               </div>
//             </div>
//           )}

//           {/* Documents View */}
//           {currentView === 'documents' && (
//             <div style={styles.contentSection}>
//               <h2 style={styles.sectionTitle}>My Documents</h2>
//               {documents.length === 0 ? (
//                 <div style={styles.emptyState}>
//                   <FileText size={48} style={styles.emptyIcon} />
//                   <p>No documents found. Create or upload your first document!</p>
//                 </div>
//               ) : (
//                 <div style={styles.documentGrid}>
//                   {documents.map((doc) => (
//                     <div key={doc.id} style={styles.documentCard}>
//                       <div style={styles.documentHeader}>
//                         <h3 style={styles.documentTitle}>{doc.title}</h3>
//                         <div style={styles.documentActions}>
//                           <button
//                             onClick={() => viewDocument(doc.id)}
//                             style={styles.actionButton}
//                             title="View document"
//                           >
//                             <Eye size={16} />
//                           </button>
//                           <button
//                             onClick={() => deleteDocument(doc.id)}
//                             style={{...styles.actionButton, ...styles.deleteButton}}
//                             title="Delete document"
//                           >
//                             <Trash2 size={16} />
//                           </button>
//                         </div>
//                       </div>
//                       <p style={styles.documentDate}>
//                         Created: {new Date(doc.created_at).toLocaleDateString()}
//                       </p>
//                       {doc.file_path && (
//                         <p style={styles.documentFile}>File: {doc.file_path}</p>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Upload View */}
//           {currentView === 'upload' && (
//             <div style={styles.contentSection}>
//               <h2 style={styles.sectionTitle}>Upload Document</h2>
//               <form onSubmit={uploadDocument} style={styles.form}>
//                 <div style={styles.inputGroup}>
//                   <label style={styles.label}>Document Title</label>
//                   <input
//                     type="text"
//                     value={uploadTitle}
//                     onChange={(e) => setUploadTitle(e.target.value)}
//                     style={styles.input}
//                     placeholder="Enter document title"
//                     required
//                   />
//                 </div>

//                 <div style={styles.inputGroup}>
//                   <label style={styles.label}>Select File</label>
//                   <input
//                     type="file"
//                     onChange={(e) => setSelectedFile(e.target.files[0])}
//                     style={styles.fileInput}
//                     accept=".pdf,.docx,.doc,.txt,.csv,.json,.md"
//                     required
//                   />
//                   <div style={styles.fileInfo}>
//                     Supported formats: PDF, DOCX, DOC, TXT, CSV, JSON, Markdown
//                     <br />
//                     Maximum file size: 10MB
//                   </div>
//                 </div>

//                 <button type="submit" style={styles.submitButton} disabled={loading}>
//                   {loading ? 'Uploading...' : 'Upload Document'}
//                 </button>
//               </form>
//             </div>
//           )}

//           {/* Create Document View */}
//           {currentView === 'create' && (
//             <div style={styles.contentSection}>
//               <h2 style={styles.sectionTitle}>Create Document</h2>
//               <form onSubmit={createDocument} style={styles.form}>
//                 <div style={styles.inputGroup}>
//                   <label style={styles.label}>Document Title</label>
//                   <input
//                     type="text"
//                     value={newDocument.title}
//                     onChange={(e) => setNewDocument({...newDocument, title: e.target.value})}
//                     style={styles.input}
//                     placeholder="Enter document title"
//                     required
//                   />
//                 </div>

//                 <div style={styles.inputGroup}>
//                   <label style={styles.label}>Content</label>
//                   <textarea
//                     value={newDocument.content}
//                     onChange={(e) => setNewDocument({...newDocument, content: e.target.value})}
//                     style={styles.textarea}
//                     placeholder="Enter document content"
//                     rows={12}
//                     required
//                   />
//                 </div>

//                 <button type="submit" style={styles.submitButton} disabled={loading}>
//                   {loading ? 'Creating...' : 'Create Document'}
//                 </button>
//               </form>
//             </div>
//           )}

//           {/* Query View */}
//           {currentView === 'query' && (
//             <div style={styles.contentSection}>
//               <h2 style={styles.sectionTitle}>Query Documents</h2>
//               <form style={styles.queryForm}>
//                 <div style={styles.queryInputGroup}>
//                   <input
//                     type="text"
//                     value={query}
//                     onChange={(e) => setQuery(e.target.value)}
//                     style={styles.queryInput}
//                     placeholder="Ask a question about your documents..."
//                   />
//                   <div style={styles.queryButtons}>
//                     <button
//                       type="button"
//                       onClick={handleQuery}
//                       style={styles.queryButton}
//                       disabled={loading || !query.trim()}
//                     >
//                       <MessageCircle size={16} />
//                       Ask AI
//                     </button>
//                     <button
//                       type="button"
//                       onClick={handleSearch}
//                       style={styles.searchButton}
//                       disabled={loading || !query.trim()}
//                     >
//                       <Search size={16} />
//                       Search
//                     </button>
//                   </div>
//                 </div>
//               </form>

//               {loading && (
//                 <div style={styles.loadingState}>
//                   <div style={styles.spinner}></div>
//                   <p>Processing your query...</p>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Query Results View */}
//           {currentView === 'queryResults' && queryResults && (
//             <div style={styles.contentSection}>
//               <div style={styles.resultsHeader}>
//                 <h2 style={styles.sectionTitle}>AI Response</h2>
//                 <button
//                   onClick={() => setCurrentView('query')}
//                   style={styles.backButton}
//                 >
//                   ← Back to Query
//                 </button>
//               </div>

//               <div style={styles.queryResultCard}>
//                 <h3 style={styles.queryTitle}>Question: {queryResults.query}</h3>
//                 <div style={styles.answerSection}>
//                   <h4 style={styles.answerTitle}>Answer:</h4>
//                   <p style={styles.answerText}>{queryResults.answer}</p>
//                 </div>

//                 {queryResults.sources && queryResults.sources.length > 0 && (
//                   <div style={styles.sourcesSection}>
//                     <h4 style={styles.sourcesTitle}>Sources:</h4>
//                     {queryResults.sources.map((source, index) => (
//                       <div key={index} style={styles.sourceCard}>
//                         <h5 style={styles.sourceTitle}>{source.title}</h5>
//                         <p style={styles.sourceContent}>{source.content}</p>
//                         <div style={styles.sourceScore}>
//                           Relevance: {(source.score * 100).toFixed(1)}%
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* Search Results View */}
//           {currentView === 'searchResults' && (
//             <div style={styles.contentSection}>
//               <div style={styles.resultsHeader}>
//                 <h2 style={styles.sectionTitle}>Search Results</h2>
//                 <button
//                   onClick={() => setCurrentView('query')}
//                   style={styles.backButton}
//                 >
//                   ← Back to Query
//                 </button>
//               </div>

//               {searchResults.length === 0 ? (
//                 <div style={styles.emptyState}>
//                   <Search size={48} style={styles.emptyIcon} />
//                   <p>No results found for your search query.</p>
//                 </div>
//               ) : (
//                 <div style={styles.searchResultsGrid}>
//                   {searchResults.map((result, index) => (
//                     <div key={index} style={styles.searchResultCard}>
//                       <h3 style={styles.resultTitle}>{result.title}</h3>
//                       <p style={styles.resultContent}>{result.content}</p>
//                       <div style={styles.resultScore}>
//                         Relevance: {(result.score * 100).toFixed(1)}%
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Document View */}
//           {currentView === 'documentView' && selectedDocument && (
//             <div style={styles.contentSection}>
//               <div style={styles.resultsHeader}>
//                 <h2 style={styles.sectionTitle}>{selectedDocument.title}</h2>
//                 <button
//                   onClick={() => setCurrentView('documents')}
//                   style={styles.backButton}
//                 >
//                   ← Back to Documents
//                 </button>
//               </div>

//               <div style={styles.documentViewCard}>
//                 <div style={styles.documentMeta}>
//                   <p><strong>Created:</strong> {new Date(selectedDocument.created_at).toLocaleString()}</p>
//                   <p><strong>Updated:</strong> {new Date(selectedDocument.updated_at).toLocaleString()}</p>
//                   {selectedDocument.file_path && (
//                     <p><strong>Source File:</strong> {selectedDocument.file_path}</p>
//                   )}
//                 </div>
//                 <div style={styles.documentContent}>
//                   <h4>Content:</h4>
//                   <pre style={styles.documentText}>{selectedDocument.content}</pre>
//                 </div>
//               </div>
//             </div>
//           )}
//         </main>
//       </div>
//     </div>
//   );
// };

// const styles = {
//   container: {
//     minHeight: '100vh',
//     backgroundColor: '#f8fafc',
//     fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
//   },

//   // Authentication Styles
//   authContainer: {
//     display: 'flex',
//     flexDirection: 'column',
//     justifyContent: 'center',
//     alignItems: 'center',
//     minHeight: '100vh',
//     padding: '20px'
//   },
//   authHeader: {
//     textAlign: 'center',
//     marginBottom: '32px'
//   },
//   title: {
//     fontSize: '32px',
//     fontWeight: '700',
//     color: '#1a202c',
//     marginBottom: '8px'
//   },
//   subtitle: {
//     fontSize: '16px',
//     color: '#718096',
//     margin: 0
//   },
//   authForm: {
//     backgroundColor: 'white',
//     padding: '32px',
//     borderRadius: '12px',
//     boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
//     width: '100%',
//     maxWidth: '400px'
//   },
//   authButton: {
//     width: '100%',
//     backgroundColor: '#4299e1',
//     color: 'white',
//     border: 'none',
//     borderRadius: '8px',
//     padding: '12px',
//     fontSize: '16px',
//     fontWeight: '600',
//     cursor: 'pointer',
//     transition: 'background-color 0.2s',
//     marginTop: '8px'
//   },
//   authSwitch: {
//     textAlign: 'center',
//     marginTop: '16px',
//     color: '#718096'
//   },
//   linkButton: {
//     background: 'none',
//     border: 'none',
//     color: '#4299e1',
//     cursor: 'pointer',
//     textDecoration: 'underline',
//     fontSize: 'inherit'
//   },

//   // Main Layout Styles
//   header: {
//     backgroundColor: 'white',
//     borderBottom: '1px solid #e2e8f0',
//     padding: '16px 24px'
//   },
//   headerContent: {
//     display: 'flex',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     maxWidth: '1200px',
//     margin: '0 auto'
//   },
//   headerTitle: {
//     fontSize: '24px',
//     fontWeight: '700',
//     color: '#1a202c',
//     margin: 0
//   },
//   headerRight: {
//     display: 'flex',
//     alignItems: 'center',
//     gap: '16px'
//   },
//   userName: {
//     display: 'flex',
//     alignItems: 'center',
//     gap: '8px',
//     color: '#4a5568',
//     fontSize: '14px'
//   },
//   logoutButton: {
//     backgroundColor: '#fed7d7',
//     color: '#c53030',
//     border: 'none',
//     borderRadius: '6px',
//     padding: '8px',
//     cursor: 'pointer',
//     display: 'flex',
//     alignItems: 'center',
//     transition: 'background-color 0.2s'
//   },

//   mainLayout: {
//     display: 'flex',
//     maxWidth: '1200px',
//     margin: '0 auto',
//     minHeight: 'calc(100vh - 73px)'
//   },

//   sidebar: {
//     width: '240px',
//     backgroundColor: 'white',
//     borderRight: '1px solid #e2e8f0',
//     padding: '24px 0',
//     display: 'flex',
//     flexDirection: 'column',
//     gap: '4px'
//   },
//   navButton: {
//     display: 'flex',
//     alignItems: 'center',
//     gap: '12px',
//     padding: '12px 24px',
//     backgroundColor: 'transparent',
//     border: 'none',
//     fontSize: '14px',
//     fontWeight: '500',
//     color: '#4a5568',
//     cursor: 'pointer',
//     transition: 'all 0.2s',
//     textAlign: 'left'
//   },
//   navButtonActive: {
//     backgroundColor: '#ebf8ff',
//     color: '#2b6cb0',
//     borderRight: '3px solid #4299e1'
//   },

//   mainContent: {
//     flex: 1,
//     padding: '24px',
//     backgroundColor: '#f8fafc'
//   },

//   // Content Styles
//   contentSection: {
//     backgroundColor: 'white',
//     borderRadius: '12px',
//     padding: '24px',
//     boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
//   },
//   sectionTitle: {
//     fontSize: '24px',
//     fontWeight: '600',
//     color: '#1a202c',
//     marginBottom: '24px',
//     margin: 0
//   },

//   // Form Styles
//   form: {
//     maxWidth: '600px'
//   },
//   inputGroup: {
//     marginBottom: '20px'
//   },
//   label: {
//     display: 'block',
//     fontSize: '14px',
//     fontWeight: '500',
//     color: '#374151',
//     marginBottom: '6px'
//   },
//   input: {
//     width: '100%',
//     padding: '10px 12px',
//     border: '1px solid #d1d5db',
//     borderRadius: '6px',
//     fontSize: '14px',
//     transition: 'border-color 0.2s',
//     boxSizing: 'border-box'
//   },
//   textarea: {
//     width: '100%',
//     padding: '10px 12px',
//     border: '1px solid #d1d5db',
//     borderRadius: '6px',
//     fontSize: '14px',
//     resize: 'vertical',
//     fontFamily: 'inherit',
//     transition: 'border-color 0.2s',
//     boxSizing: 'border-box'
//   },
//   fileInput: {
//     width: '100%',
//     padding: '8px',
//     border: '1px solid #d1d5db',
//     borderRadius: '6px',
//     fontSize: '14px',
//     boxSizing: 'border-box'
//   },
//   fileInfo: {
//     fontSize: '12px',
//     color: '#6b7280',
//     marginTop: '6px'
//   },
//   submitButton: {
//     backgroundColor: '#10b981',
//     color: 'white',
//     border: 'none',
//     borderRadius: '8px',
//     padding: '12px 24px',
//     fontSize: '14px',
//     fontWeight: '600',
//     cursor: 'pointer',
//     transition: 'background-color 0.2s'
//   },

//   // Document Grid Styles
//   documentGrid: {
//     display: 'grid',
//     gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
//     gap: '16px'
//   },
//   documentCard: {
//     backgroundColor: '#f9fafb',
//     border: '1px solid #e5e7eb',
//     borderRadius: '8px',
//     padding: '16px',
//     transition: 'box-shadow 0.2s'
//   },
//   documentHeader: {
//     display: 'flex',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     marginBottom: '8px'
//   },
//   documentTitle: {
//     fontSize: '16px',
//     fontWeight: '600',
//     color: '#1f2937',
//     margin: 0,
//     flex: 1
//   },
//   documentActions: {
//     display: 'flex',
//     gap: '8px'
//   },
//   documentDate: {
//     fontSize: '12px',
//     color: '#6b7280',
//     margin: '4px 0'
//   },
//   documentFile: {
//     fontSize: '12px',
//     color: '#9ca3af',
//     margin: '4px 0'
//   },
//   actionButton: {
//     backgroundColor: '#f3f4f6',
//     border: '1px solid #d1d5db',
//     borderRadius: '4px',
//     padding: '6px',
//     cursor: 'pointer',
//     display: 'flex',
//     alignItems: 'center',
//     transition: 'background-color 0.2s'
//   },
//   deleteButton: {
//     backgroundColor: '#fef2f2',
//     borderColor: '#fecaca',
//     color: '#dc2626'
//   },

//   // Query Styles
//   queryForm: {
//     marginBottom: '24px'
//   },
//   queryInputGroup: {
//     display: 'flex',
//     gap: '12px',
//     alignItems: 'flex-end'
//   },
//   queryInput: {
//     flex: 1,
//     padding: '12px',
//     border: '1px solid #d1d5db',
//     borderRadius: '8px',
//     fontSize: '16px',
//     transition: 'border-color 0.2s'
//   },
//   queryButtons: {
//     display: 'flex',
//     gap: '8px'
//   },
//   queryButton: {
//     backgroundColor: '#4299e1',
//     color: 'white',
//     border: 'none',
//     borderRadius: '6px',
//     padding: '12px 16px',
//     fontSize: '14px',
//     fontWeight: '500',
//     cursor: 'pointer',
//     display: 'flex',
//     alignItems: 'center',
//     gap: '6px',
//     transition: 'background-color 0.2s'
//   },
//   searchButton: {
//     backgroundColor: '#6b7280',
//     color: 'white',
//     border: 'none',
//     borderRadius: '6px',
//     padding: '12px 16px',
//     fontSize: '14px',
//     fontWeight: '500',
//     cursor: 'pointer',
//     display: 'flex',
//     alignItems: 'center',
//     gap: '6px',
//     transition: 'background-color 0.2s'
//   },

//   // Results Styles
//   resultsHeader: {
//     display: 'flex',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: '24px'
//   },
//   backButton: {
//     backgroundColor: '#f3f4f6',
//     border: '1px solid #d1d5db',
//     borderRadius: '6px',
//     padding: '8px 16px',
//     fontSize: '14px',
//     cursor: 'pointer',
//     transition: 'background-color 0.2s'
//   },
//   queryResultCard: {
//     backgroundColor: '#f8fafc',
//     border: '1px solid #e2e8f0',
//     borderRadius: '8px',
//     padding: '20px'
//   },
//   queryTitle: {
//     fontSize: '18px',
//     fontWeight: '600',
//     color: '#1a202c',
//     marginBottom: '16px'
//   },
//   answerSection: {
//     marginBottom: '24px'
//   },
//   answerTitle: {
//     fontSize: '16px',
//     fontWeight: '600',
//     color: '#2d3748',
//     marginBottom: '8px'
//   },
//   answerText: {
//     fontSize: '14px',
//     lineHeight: '1.6',
//     color: '#4a5568',
//     backgroundColor: 'white',
//     padding: '16px',
//     borderRadius: '6px',
//     border: '1px solid #e2e8f0'
//   },
//   sourcesSection: {
//     marginTop: '24px'
//   },
//   sourcesTitle: {
//     fontSize: '16px',
//     fontWeight: '600',
//     color: '#2d3748',
//     marginBottom: '12px'
//   },
//   sourceCard: {
//     backgroundColor: 'white',
//     border: '1px solid #e2e8f0',
//     borderRadius: '6px',
//     padding: '16px',
//     marginBottom: '12px'
//   },
//   sourceTitle: {
//     fontSize: '14px',
//     fontWeight: '600',
//     color: '#1a202c',
//     marginBottom: '8px'
//   },
//   sourceContent: {
//     fontSize: '13px',
//     color: '#4a5568',
//     lineHeight: '1.5',
//     marginBottom: '8px'
//   },
//   sourceScore: {
//     fontSize: '12px',
//     color: '#718096',
//     fontWeight: '500'
//   },

//   // Search Results Styles
//   searchResultsGrid: {
//     display: 'grid',
//     gap: '16px'
//   },
//   searchResultCard: {
//     backgroundColor: '#f9fafb',
//     border: '1px solid #e5e7eb',
//     borderRadius: '8px',
//     padding: '16px'
//   },
//   resultTitle: {
//     fontSize: '16px',
//     fontWeight: '600',
//     color: '#1f2937',
//     marginBottom: '8px'
//   },
//   resultContent: {
//     fontSize: '14px',
//     color: '#4b5563',
//     lineHeight: '1.5',
//     marginBottom: '8px'
//   },
//   resultScore: {
//     fontSize: '12px',
//     color: '#6b7280',
//     fontWeight: '500'
//   },

//   // Document View Styles
//   documentViewCard: {
//     backgroundColor: '#f8fafc',
//     border: '1px solid #e2e8f0',
//     borderRadius: '8px',
//     padding: '24px'
//   },
//   documentMeta: {
//     backgroundColor: 'white',
//     padding: '16px',
//     borderRadius: '6px',
//     marginBottom: '20px',
//     border: '1px solid #e2e8f0'
//   },
//   documentContent: {
//     backgroundColor: 'white',
//     padding: '16px',
//     borderRadius: '6px',
//     border: '1px solid #e2e8f0'
//   },
//   documentText: {
//     fontSize: '13px',
//     lineHeight: '1.6',
//     color: '#374151',
//     whiteSpace: 'pre-wrap',
//     fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, monospace',
//     maxHeight: '500px',
//     overflowY: 'auto',
//     backgroundColor: '#f9fafb',
//     padding: '16px',
//     borderRadius: '4px',
//     border: '1px solid #e5e7eb'
//   },

//   // State Styles
//   emptyState: {
//     textAlign: 'center',
//     padding: '48px 24px',
//     color: '#6b7280'
//   },
//   emptyIcon: {
//     color: '#d1d5db',
//     marginBottom: '16px'
//   },
//   loadingState: {
//     textAlign: 'center',
//     padding: '48px 24px',
//     color: '#6b7280'
//   },
//   spinner: {
//     width: '32px',
//     height: '32px',
//     border: '3px solid #f3f4f6',
//     borderTop: '3px solid #4299e1',
//     borderRadius: '50%',
//     animation: 'spin 1s linear infinite',
//     margin: '0 auto 16px'
//   },

//   // Notification Styles
//   notification: {
//     marginBottom: '16px'
//   },
//   error: {
//     backgroundColor: '#fef2f2',
//     border: '1px solid #fecaca',
//     color: '#dc2626',
//     padding: '12px 16px',
//     borderRadius: '6px',
//     display: 'flex',
//     justifyContent: 'space-between',
//     alignItems: 'center'
//   },
//   success: {
//     backgroundColor: '#f0fdf4',
//     border: '1px solid #bbf7d0',
//     color: '#16a34a',
//     padding: '12px 16px',
//     borderRadius: '6px',
//     display: 'flex',
//     justifyContent: 'space-between',
//     alignItems: 'center'
//   },
//   closeButton: {
//     background: 'none',
//     border: 'none',
//     fontSize: '18px',
//     cursor: 'pointer',
//     marginLeft: '12px',
//   }
// };

// // Add CSS animation for spinner
// const style = document.createElement('style');
// style.textContent = `
//   @keyframes spin {
//     0% { transform: rotate(0deg); }
//     100% { transform: rotate(360deg); }
//   }
// `;
// export default App;


import React, { useState, useEffect } from 'react';
import { Upload, FileText, Search, User, LogOut, Plus, Trash2, Eye, MessageCircle, Menu, X } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const App = () => {
  const [user, setUser] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [currentView, setCurrentView] = useState('documents');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auth state
  const [authMode, setAuthMode] = useState('login');
  const [authData, setAuthData] = useState({ username: '', email: '', password: '', confirmPassword: '' });

  // Document state
  const [newDocument, setNewDocument] = useState({ title: '', content: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');

  // Query state
  const [query, setQuery] = useState('');
  const [queryResults, setQueryResults] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) fetchUserProfile(token);
  }, []);

  useEffect(() => {
    if (user) fetchDocuments();
  }, [user]);

  const apiCall = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}`);
    }
    return response.json();
  };

  const fetchUserProfile = async (token) => {
    try {
      const userData = await apiCall('/auth/me');
      setUser(userData);
    } catch (err) {
      localStorage.removeItem('token');
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (authMode === 'register') {
        if (authData.password !== authData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        await apiCall('/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            username: authData.username,
            email: authData.email,
            password: authData.password
          })
        });
        setSuccess('Registration successful! Please login.');
        setAuthMode('login');
      } else {
        const formData = new FormData();
        formData.append('username', authData.username);
        formData.append('password', authData.password);

        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Login failed');
        }

        const tokenData = await response.json();
        localStorage.setItem('token', tokenData.access_token);
        await fetchUserProfile(tokenData.access_token);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setDocuments([]);
    setCurrentView('documents');
  };

  const fetchDocuments = async () => {
    try {
      const docs = await apiCall('/documents/');
      setDocuments(docs);
    } catch (err) {
      setError('Failed to fetch documents');
    }
  };

  const createDocument = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await apiCall('/documents/', {
        method: 'POST',
        body: JSON.stringify(newDocument)
      });
      setSuccess('Document created successfully!');
      setNewDocument({ title: '', content: '' });
      await fetchDocuments();
      setCurrentView('documents');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (e) => {
    e.preventDefault();
    if (!selectedFile || !uploadTitle) {
      setError('Please provide both title and file');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', uploadTitle);
      formData.append('file', selectedFile);

      const response = await fetch(`${API_BASE_URL}/documents/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }

      setSuccess('Document uploaded successfully!');
      setSelectedFile(null);
      setUploadTitle('');
      await fetchDocuments();
      setCurrentView('documents');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      await apiCall(`/documents/${docId}`, { method: 'DELETE' });
      setSuccess('Document deleted successfully!');
      await fetchDocuments();
    } catch (err) {
      setError(err.message);
    }
  };

  const viewDocument = async (docId) => {
    try {
      const doc = await apiCall(`/documents/${docId}`);
      setSelectedDocument(doc);
      setCurrentView('documentView');
    } catch (err) {
      setError('Failed to fetch document');
    }
  };

  const handleQuery = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');

    try {
      const result = await apiCall('/query/', {
        method: 'POST',
        body: JSON.stringify({ query, top_k: 5 })
      });
      setQueryResults(result);
      setCurrentView('queryResults');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');

    try {
      const results = await apiCall('/query/search', {
        method: 'POST',
        body: JSON.stringify({ query, top_k: 10 })
      });
      setSearchResults(results);
      setCurrentView('searchResults');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="logo">
              <FileText size={32} />
            </div>
            <h1>RAG Document System</h1>
            <p>{authMode === 'login' ? 'Welcome back' : 'Create your account'}</p>
          </div>

          <form onSubmit={handleAuth} className="auth-form">
            <div className="input-group">
              <input
                type="text"
                placeholder="Username"
                value={authData.username}
                onChange={(e) => setAuthData({...authData, username: e.target.value})}
                required
              />
            </div>

            {authMode === 'register' && (
              <div className="input-group">
                <input
                  type="email"
                  placeholder="Email"
                  value={authData.email}
                  onChange={(e) => setAuthData({...authData, email: e.target.value})}
                  required
                />
              </div>
            )}

            <div className="input-group">
              <input
                type="password"
                placeholder="Password"
                value={authData.password}
                onChange={(e) => setAuthData({...authData, password: e.target.value})}
                required
              />
            </div>

            {authMode === 'register' && (
              <div className="input-group">
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={authData.confirmPassword}
                  onChange={(e) => setAuthData({...authData, confirmPassword: e.target.value})}
                  required
                />
              </div>
            )}

            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? (
                <div className="spinner"></div>
              ) : (
                authMode === 'login' ? 'Sign In' : 'Sign Up'
              )}
            </button>

            <div className="auth-switch">
              {authMode === 'login' ? (
                <>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {setAuthMode('register'); setError(''); setSuccess('');}}
                    className="link-btn"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {setAuthMode('login'); setError(''); setSuccess('');}}
                    className="link-btn"
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>
          </form>
        </div>

        <style jsx>{`
          .auth-container {
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }

          .auth-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            width: 100%;
            max-width: 400px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            animation: slideUp 0.6s ease-out;
          }

          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .auth-header {
            text-align: center;
            margin-bottom: 30px;
          }

          .logo {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            width: 60px;
            height: 60px;
            border-radius: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            animation: pulse 2s infinite;
          }

          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }

          .auth-header h1 {
            margin: 0 0 10px;
            font-size: 28px;
            font-weight: 700;
            background: linear-gradient(135deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }

          .auth-header p {
            margin: 0;
            color: #666;
            font-size: 16px;
          }

          .input-group {
            margin-bottom: 20px;
          }

          .input-group input {
            width: 100%;
            padding: 15px;
            border: 2px solid #e1e5e9;
            border-radius: 12px;
            font-size: 16px;
            transition: all 0.3s ease;
            background: white;
            box-sizing: border-box;
          }

          .input-group input:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            transform: translateY(-2px);
          }

          .auth-btn {
            width: 100%;
            padding: 15px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 50px;
          }

          .auth-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
          }

          .auth-btn:disabled {
            opacity: 0.7;
            cursor: not-allowed;
          }

          .spinner {
            width: 20px;
            height: 20px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-top: 2px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }

          .auth-switch {
            text-align: center;
            margin-top: 20px;
            color: #666;
          }

          .link-btn {
            background: none;
            border: none;
            color: #667eea;
            cursor: pointer;
            font-weight: 600;
            text-decoration: underline;
          }

          .error, .success {
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 15px;
            animation: slideIn 0.3s ease;
          }

          .error {
            background: #fee;
            color: #c53030;
            border: 1px solid #fed7d7;
          }

          .success {
            background: #f0fff4;
            color: #22543d;
            border: 1px solid #c6f6d5;
          }

          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateX(-10px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <button 
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="logo">
              <FileText size={24} />
            </div>
            <h1>RAG Document System</h1>
          </div>
          <div className="header-right">
            <div className="user-info">
              <User size={16} />
              <span>{user.username}</span>
            </div>
            <button onClick={handleLogout} className="logout-btn">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <div className="main-layout">
        <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="nav-items">
            {[
              { id: 'documents', icon: FileText, label: 'Documents' },
              { id: 'upload', icon: Upload, label: 'Upload' },
              { id: 'create', icon: Plus, label: 'Create' },
              { id: 'query', icon: MessageCircle, label: 'Query' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => {setCurrentView(item.id); setSidebarOpen(false);}}
                className={`nav-btn ${currentView === item.id ? 'active' : ''}`}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        <main className="main-content">
          {(error || success) && (
            <div className={`notification ${error ? 'error' : 'success'}`}>
              <span>{error || success}</span>
              <button onClick={() => {setError(''); setSuccess('');}} className="close-btn">×</button>
            </div>
          )}

          <div className="content-area">
            {currentView === 'documents' && (
              <div className="view-container">
                <h2>My Documents</h2>
                {documents.length === 0 ? (
                  <div className="empty-state">
                    <FileText size={64} />
                    <h3>No documents yet</h3>
                    <p>Create or upload your first document to get started!</p>
                  </div>
                ) : (
                  <div className="document-grid">
                    {documents.map((doc, index) => (
                      <div key={doc.id} className="document-card" style={{animationDelay: `${index * 0.1}s`}}>
                        <div className="card-header">
                          <h3>{doc.title}</h3>
                          <div className="card-actions">
                            <button onClick={() => viewDocument(doc.id)} className="action-btn view">
                              <Eye size={16} />
                            </button>
                            <button onClick={() => deleteDocument(doc.id)} className="action-btn delete">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <p className="card-date">{new Date(doc.created_at).toLocaleDateString()}</p>
                        {doc.file_path && <p className="card-file">📄 {doc.file_path}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {currentView === 'upload' && (
              <div className="view-container">
                <h2>Upload Document</h2>
                <form onSubmit={uploadDocument} className="form">
                  <div className="form-group">
                    <input
                      type="text"
                      placeholder="Document Title"
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <div className="file-input-wrapper">
                      <input
                        type="file"
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                        accept=".pdf,.docx,.doc,.txt,.csv,.json,.md"
                        required
                      />
                      <div className="file-info">
                        Supported: PDF, DOCX, DOC, TXT, CSV, JSON, MD (max 10MB)
                      </div>
                    </div>
                  </div>
                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? <div className="spinner"></div> : <>Upload Document</>}
                  </button>
                </form>
              </div>
            )}

            {currentView === 'create' && (
              <div className="view-container">
                <h2>Create Document</h2>
                <form onSubmit={createDocument} className="form">
                  <div className="form-group">
                    <input
                      type="text"
                      placeholder="Document Title"
                      value={newDocument.title}
                      onChange={(e) => setNewDocument({...newDocument, title: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <textarea
                      placeholder="Enter your content here..."
                      value={newDocument.content}
                      onChange={(e) => setNewDocument({...newDocument, content: e.target.value})}
                      rows={12}
                      required
                    />
                  </div>
                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? <div className="spinner"></div> : <>Create Document</>}
                  </button>
                </form>
              </div>
            )}

            {currentView === 'query' && (
              <div className="view-container">
                <h2>Query Documents</h2>
                <div className="query-section">
                  <div className="query-input-group">
                    <input
                      type="text"
                      placeholder="Ask a question about your documents..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="query-input"
                    />
                    <div className="query-buttons">
                      <button
                        onClick={handleQuery}
                        disabled={loading || !query.trim()}
                        className="query-btn ai"
                      >
                        <MessageCircle size={16} />
                        Ask AI
                      </button>
                      <button
                        onClick={handleSearch}
                        disabled={loading || !query.trim()}
                        className="query-btn search"
                      >
                        <Search size={16} />
                        Search
                      </button>
                    </div>
                  </div>
                  {loading && (
                    <div className="loading-state">
                      <div className="loading-spinner"></div>
                      <p>Processing your query...</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentView === 'queryResults' && queryResults && (
              <div className="view-container">
                <div className="results-header">
                  <h2>AI Response</h2>
                  <button onClick={() => setCurrentView('query')} className="back-btn">
                    ← Back
                  </button>
                </div>
                <div className="result-card">
                  <div className="query-display">
                    <strong>Q:</strong> {queryResults.query}
                  </div>
                  <div className="answer-section">
                    <strong>Answer:</strong>
                    <p>{queryResults.answer}</p>
                  </div>
                  {queryResults.sources && queryResults.sources.length > 0 && (
                    <div className="sources-section">
                      <h4>Sources:</h4>
                      {queryResults.sources.map((source, index) => (
                        <div key={index} className="source-card">
                          <h5>{source.title}</h5>
                          <p>{source.content}</p>
                          <div className="relevance">Relevance: {(source.score * 100).toFixed(1)}%</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentView === 'searchResults' && (
              <div className="view-container">
                <div className="results-header">
                  <h2>Search Results</h2>
                  <button onClick={() => setCurrentView('query')} className="back-btn">
                    ← Back
                  </button>
                </div>
                {searchResults.length === 0 ? (
                  <div className="empty-state">
                    <Search size={64} />
                    <h3>No results found</h3>
                    <p>Try adjusting your search terms</p>
                  </div>
                ) : (
                  <div className="search-results">
                    {searchResults.map((result, index) => (
                      <div key={index} className="search-result-card" style={{animationDelay: `${index * 0.1}s`}}>
                        <h3>{result.title}</h3>
                        <p>{result.content}</p>
                        <div className="relevance">Relevance: {(result.score * 100).toFixed(1)}%</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {currentView === 'documentView' && selectedDocument && (
              <div className="view-container">
                <div className="results-header">
                  <h2>{selectedDocument.title}</h2>
                  <button onClick={() => setCurrentView('documents')} className="back-btn">
                    ← Back
                  </button>
                </div>
                <div className="document-view">
                  <div className="document-meta">
                    <div><strong>Created:</strong> {new Date(selectedDocument.created_at).toLocaleString()}</div>
                    <div><strong>Updated:</strong> {new Date(selectedDocument.updated_at).toLocaleString()}</div>
                    {selectedDocument.file_path && (
                      <div><strong>Source:</strong> {selectedDocument.file_path}</div>
                    )}
                  </div>
                  <div className="document-content">
                    <h4>Content:</h4>
                    <pre>{selectedDocument.content}</pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .app {
          min-height: 100vh;
          background: #f8fafc;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: #1a202c;
        }

        .header {
          background: white;
          border-bottom: 1px solid #e2e8f0;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          transition: background 0.2s;
        }

        .mobile-menu-btn:hover {
          background: #f7fafc;
        }

        .logo {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: logoGlow 3s ease-in-out infinite alternate;
        }

        @keyframes logoGlow {
          from { box-shadow: 0 0 5px rgba(102, 126, 234, 0.3); }
          to { box-shadow: 0 0 20px rgba(102, 126, 234, 0.6); }
        }

        .header h1 {
          font-size: 24px;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #4a5568;
          font-size: 14px;
          padding: 8px 12px;
          background: #f7fafc;
          border-radius: 8px;
        }

        .logout-btn {
          background: linear-gradient(135deg, #fc8181, #f56565);
          color: white;
          border: none;
          border-radius: 8px;
          padding: 8px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
        }

        .logout-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(245, 101, 101, 0.3);
        }

        .main-layout {
          display: flex;
          max-width: 1400px;
          margin: 0 auto;
          min-height: calc(100vh - 73px);
        }

        .sidebar {
          width: 240px;
          background: white;
          border-right: 1px solid #e2e8f0;
          padding: 24px 0;
          position: sticky;
          top: 73px;
          height: calc(100vh - 73px);
          overflow-y: auto;
          transition: all 0.3s ease;
        }

        .nav-items {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 0 16px;
        }

        .nav-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: none;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #4a5568;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
          width: 100%;
        }

        .nav-btn:hover {
          background: #f7fafc;
          color: #2d3748;
          transform: translateX(4px);
        }

        .nav-btn.active {
          background: linear-gradient(135deg, #ebf8ff, #bee3f8);
          color: #2b6cb0;
          position: relative;
        }

        .nav-btn.active::after {
          content: '';
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 2px 0 0 2px;
        }

        .main-content {
          flex: 1;
          padding: 24px;
          overflow-x: hidden;
        }

        .notification {
          margin-bottom: 24px;
          padding: 16px;
          border-radius: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          animation: slideDown 0.3s ease;
        }

        .notification.error {
          background: linear-gradient(135deg, #fed7d7, #feb2b2);
          color: #c53030;
          border: 1px solid #fc8181;
        }

        .notification.success {
          background: linear-gradient(135deg, #c6f6d5, #9ae6b4);
          color: #22543d;
          border: 1px solid #68d391;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          opacity: 0.7;
          transition: opacity 0.2s;
        }

        .close-btn:hover {
          opacity: 1;
        }

        .content-area {
          background: white;
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          animation: fadeIn 0.5s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .view-container h2 {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 24px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .empty-state {
          text-align: center;
          padding: 64px 24px;
          color: #a0aec0;
        }

        .empty-state svg {
          opacity: 0.3;
          margin-bottom: 16px;
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .empty-state h3 {
          font-size: 20px;
          margin-bottom: 8px;
          color: #4a5568;
        }

        .document-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
        }

        .document-card {
          background: linear-gradient(145deg, #ffffff, #f7fafc);
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 24px;
          transition: all 0.3s ease;
          animation: slideUp 0.5s ease forwards;
          opacity: 0;
          transform: translateY(20px);
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }

        .document-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }

        .document-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
        }

        .document-card:hover::before {
          transform: scaleX(1);
        }

        @keyframes slideUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .card-header h3 {
          font-size: 18px;
          font-weight: 600;
          color: #1a202c;
          margin: 0;
          flex: 1;
        }

        .card-actions {
          display: flex;
          gap: 8px;
        }

        .action-btn {
          padding: 8px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
        }

        .action-btn.view {
          background: #e6fffa;
          color: #319795;
        }

        .action-btn.delete {
          background: #fed7d7;
          color: #e53e3e;
        }

        .action-btn:hover {
          transform: scale(1.1);
        }

        .card-date, .card-file {
          font-size: 12px;
          color: #718096;
          margin: 4px 0;
        }

        .form {
          max-width: 600px;
        }

        .form-group {
          margin-bottom: 24px;
        }

        .form-group input, 
        .form-group textarea {
          width: 100%;
          padding: 16px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 16px;
          transition: all 0.3s ease;
          background: #fafafa;
          font-family: inherit;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #667eea;
          background: white;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          transform: translateY(-2px);
        }

        .form-group textarea {
          resize: vertical;
          min-height: 200px;
        }

        .file-input-wrapper input[type="file"] {
          background: white;
          cursor: pointer;
        }

        .file-info {
          font-size: 12px;
          color: #718096;
          margin-top: 8px;
        }

        .submit-btn {
          background: linear-gradient(135deg, #48bb78, #38a169);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 16px 32px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 52px;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(72, 187, 120, 0.3);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .query-input-group {
          display: flex;
          gap: 16px;
          align-items: flex-end;
          margin-bottom: 32px;
        }

        .query-input {
          flex: 1;
          padding: 16px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 16px;
          transition: all 0.3s ease;
          background: #fafafa;
        }

        .query-input:focus {
          outline: none;
          border-color: #667eea;
          background: white;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .query-buttons {
          display: flex;
          gap: 12px;
        }

        .query-btn {
          padding: 16px 20px;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 120px;
          justify-content: center;
        }

        .query-btn.ai {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
        }

        .query-btn.search {
          background: linear-gradient(135deg, #4fd1c7, #38b2ac);
          color: white;
        }

        .query-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        }

        .query-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .loading-state {
          text-align: center;
          padding: 48px;
          color: #718096;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e2e8f0;
          border-top: 3px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 16px;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .back-btn {
          background: #f7fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 14px;
        }

        .back-btn:hover {
          background: #edf2f7;
          transform: translateX(-2px);
        }

        .result-card {
          background: linear-gradient(145deg, #f7fafc, #edf2f7);
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 32px;
          animation: slideUp 0.5s ease;
        }

        .query-display {
          background: white;
          padding: 16px;
          border-radius: 12px;
          margin-bottom: 24px;
          border-left: 4px solid #667eea;
          font-size: 16px;
        }

        .answer-section {
          background: white;
          padding: 24px;
          border-radius: 12px;
          margin-bottom: 24px;
          border-left: 4px solid #48bb78;
        }

        .answer-section p {
          margin-top: 12px;
          line-height: 1.6;
          color: #4a5568;
        }

        .sources-section h4 {
          margin-bottom: 16px;
          color: #2d3748;
          font-size: 18px;
        }

        .source-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 16px;
          transition: all 0.3s ease;
        }

        .source-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .source-card h5 {
          margin-bottom: 8px;
          color: #1a202c;
          font-size: 16px;
        }

        .source-card p {
          color: #4a5568;
          line-height: 1.5;
          margin-bottom: 12px;
        }

        .relevance {
          font-size: 12px;
          color: #718096;
          font-weight: 600;
          background: #f7fafc;
          padding: 4px 8px;
          border-radius: 6px;
          display: inline-block;
        }

        .search-results {
          display: grid;
          gap: 20px;
        }

        .search-result-card {
          background: linear-gradient(145deg, #ffffff, #f7fafc);
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 24px;
          transition: all 0.3s ease;
          animation: slideUp 0.5s ease forwards;
          opacity: 0;
          transform: translateY(20px);
        }

        .search-result-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
        }

        .search-result-card h3 {
          margin-bottom: 12px;
          color: #1a202c;
          font-size: 18px;
        }

        .search-result-card p {
          color: #4a5568;
          line-height: 1.5;
          margin-bottom: 12px;
        }

        .document-view {
          animation: slideUp 0.5s ease;
        }

        .document-meta {
          background: linear-gradient(145deg, #f7fafc, #edf2f7);
          padding: 24px;
          border-radius: 12px;
          margin-bottom: 24px;
          border-left: 4px solid #667eea;
        }

        .document-meta div {
          margin-bottom: 8px;
          color: #4a5568;
        }

        .document-content {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 24px;
        }

        .document-content h4 {
          margin-bottom: 16px;
          color: #2d3748;
          font-size: 18px;
        }

        .document-content pre {
          background: #f7fafc;
          padding: 20px;
          border-radius: 8px;
          overflow-x: auto;
          line-height: 1.6;
          color: #2d3748;
          white-space: pre-wrap;
          font-size: 14px;
          border: 1px solid #e2e8f0;
        }

        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: block;
          }

          .sidebar {
            position: fixed;
            left: -240px;
            top: 73px;
            z-index: 50;
            box-shadow: 4px 0 8px rgba(0, 0, 0, 0.1);
          }

          .sidebar.open {
            left: 0;
          }

          .main-content {
            padding: 16px;
          }

          .content-area {
            padding: 20px;
          }

          .query-input-group {
            flex-direction: column;
            gap: 12px;
          }

          .query-buttons {
            width: 100%;
          }

          .query-btn {
            flex: 1;
          }

          .document-grid {
            grid-template-columns: 1fr;
          }

          .results-header {
            flex-direction: column;
            gap: 16px;
            align-items: flex-start;
          }

          .header-left h1 {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default App;