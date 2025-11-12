import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './YourSocialMediaPost.css';
import { getAllPosts, createPost as apiCreatePost, createComment as apiCreateComment, createReaction as apiCreateReaction, deleteReaction as apiDeleteReaction, getCurrentUser, getCommentsByPostId, deletePost as apiDeletePost, deleteComment as apiDeleteComment } from '../API/SocialMediaApi';
import Header from './Header';

const YourSocialMediaPost = () => {
  const navigate = useNavigate();
  const backendUrl = "http://localhost:5002";
  // State management
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const [newPostText, setNewPostText] = useState('');
  const [pendingImages, setPendingImages] = useState([]);
  const [commentInputs, setCommentInputs] = useState({}); // Key: postId
  const [commentImages, setCommentImages] = useState({}); // Store images for each comment input by postId
  const [replyInputs, setReplyInputs] = useState({}); // Key: `${postId}-${commentId}`
  const [replyImages, setReplyImages] = useState({}); // Key: `${postId}-${commentId}`
  const [visibleReplies, setVisibleReplies] = useState({}); // Key: `${postId}-${commentId}`
  const [visibleComments, setVisibleComments] = useState({});
  const [hoverTimeouts, setHoverTimeouts] = useState({});
  const [commentHoverTimeouts, setCommentHoverTimeouts] = useState({}); // For comment reaction menus
  const [commentHideTimeouts, setCommentHideTimeouts] = useState({}); // For delayed hiding of comment reaction menus
  const [loadedComments, setLoadedComments] = useState({}); // Store loaded comments for each post
  const [userId, setUserId] = useState(null); // Will be set from userInfo
  const [userInfo, setUserInfo] = useState(null); // Current user info
  const [filterType, setFilterType] = useState('newest'); // Filter type: 'newest', 'oldest', 'hottest'
  const [sidebarActive, setSidebarActive] = useState(false);

  const toggleSidebar = () => setSidebarActive(!sidebarActive);

  const fileInputRef = useRef(null);
  const commentFileInputRefs = useRef({}); // Store refs for each comment input by postId
  const replyFileInputRefs = useRef({}); // Store refs for each reply input by `${postId}-${commentId}`

  // Format reaction counts in Vietnamese
  const formatReactionCounts = (reactionCounts) => {
    if (!reactionCounts || Object.keys(reactionCounts).length === 0) {
      return null;
    }

    const reactionLabels = {
      'like': 'thích',
      'dislike': 'không thích',
      'love': 'thương',
      'haha': 'haha',
      'wow': 'wow',
      'angry': 'tức giận'
    };

    const parts = [];
    const order = ['like', 'dislike', 'love', 'haha', 'wow', 'angry'];
    
    for (const type of order) {
      if (reactionCounts[type] && reactionCounts[type] > 0) {
        const label = reactionLabels[type] || type;
        parts.push(`${reactionCounts[type]} ${label}`);
      }
    }

    return parts.length > 0 ? parts.join(', ') : null;
  };


  // Fetch posts from backend
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const postsData = await getAllPosts();

      // Transform backend data to frontend format and filter by userId
      const publicUrl = (process.env.PUBLIC_URL || '').replace(/\/$/, '');
      
      const transformedPosts = postsData
        .filter(post => {
          // Backend returns PosterId as string, need to compare correctly
          const postAuthorId = parseInt(post.PosterId || post.AuthorId || '0', 10);
          const currentUserIdNum = typeof userId === 'string' ? parseInt(userId, 10) : userId;
          return postAuthorId === currentUserIdNum;
        }) // Only show posts by current user
        .map(post => {
          // Process images - use same architecture as service-combo-manager
          let images = [];
          
          // Handle array format - only filenames are supported
          if (post.Images && Array.isArray(post.Images) && post.Images.length > 0) {
            images = post.Images
              .filter(img => img && img.trim())
              .map(img => {
                const imgName = img.trim();
                
                // Skip base64 images (old posts) - they are no longer supported
                if (imgName.startsWith('data:image') || imgName.length > 200) {
                  return null; // Filter out old base64 images
                }
                
                // Treat as filename - construct URLs
                const candidates = [
                  `${backendUrl}/images/${imgName}`,
                  `${backendUrl}/img/uploads/${imgName}`,
                  `${publicUrl}/img/uploads/${imgName}`
                ];
                
                return {
                  src: candidates[0] || '/img/stock_nimg.jpg',
                  candidates: candidates.length > 0 ? candidates : ['/img/stock_nimg.jpg']
                };
              })
              .filter(img => img !== null); // Filter out null entries
          } else if (post.Image && typeof post.Image === 'string' && post.Image.trim()) {
            // Handle single image string - only filenames are supported
            const imgName = post.Image.trim();
            
            // Skip base64 images (old posts) - they are no longer supported
            if (!imgName.startsWith('data:image') && imgName.length <= 200) {
              const candidates = [
                `${backendUrl}/images/${imgName}`,
                `${backendUrl}/img/uploads/${imgName}`,
                `${publicUrl}/img/uploads/${imgName}`
              ];
              
              images = [{
                src: candidates[0] || '/img/stock_nimg.jpg',
                candidates: candidates.length > 0 ? candidates : ['/img/stock_nimg.jpg']
              }];
            }
          }
          
          // Parse PublicDate to Date object (same as SocialMedia.js)
          let createdAt = new Date();
          if (post.PublicDate) {
            // Format: "dd/MM/yyyy HH:mm"
            const dateParts = post.PublicDate.split(' ');
            if (dateParts.length === 2) {
              const [datePart, timePart] = dateParts;
              const [day, month, year] = datePart.split('/');
              const [hour, minute] = timePart.split(':');
              createdAt = new Date(year, month - 1, day, hour, minute);
            }
          }
          
          // Limit to only 1 image since program only supports 1
          const limitedImages = images.length > 0 ? [images[0]] : [];
          
          // Process poster avatar - backend returns filename, not base64
          let posterAvatarUrl = '/img/stock_nimg.jpg'; // Default
          const posterAvatarFileName = post.PosterAvatar || null;
          if (posterAvatarFileName && posterAvatarFileName.trim() !== '') {
            // Skip base64 avatars (old data) - they are no longer supported
            if (!posterAvatarFileName.startsWith('data:image') && posterAvatarFileName.length <= 200) {
              // Construct URL from filename (same as comment avatars)
              posterAvatarUrl = `${backendUrl}/images/${posterAvatarFileName}`;
            }
          }
          
          return {
            id: parseInt(post.PostId) || 0,
            username: post.PosterName || 'Unknown',
            authorId: parseInt(post.PosterId || post.AuthorId || '0', 10),
            avatar: posterAvatarUrl,
            images: limitedImages, // Array of image objects with src and candidates (max 1)
            image: limitedImages.length > 0 ? limitedImages[0].src : null, // First image src for backward compatibility
            text: post.PostContent || '',
            title: post.ArticleTitle || '',
            reaction: post.CurrentUserReaction || null, // Current user's reaction type
            comments: post.Comments || [], // Backend provides comments
            createdAt: createdAt,
            commentsCount: post.Comments ? post.Comments.length : 0,
            reactionsCount: post.Likes ? post.Likes.length : 0,
            reactionCounts: post.ReactionCounts || {} // Reaction counts by type from backend
          };
        });

      // Sort posts based on filter type
      const sortedPosts = sortPosts(transformedPosts, filterType);
      setPosts(sortedPosts);
      setError(null);
    } catch (err) {
      setError('Failed to load posts');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Sort posts based on filter type
  const sortPosts = (posts, filter) => {
    const sorted = [...posts];
    switch (filter) {
      case 'newest':
        return sorted.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
          const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
          return dateB - dateA; // Newest first
        });
      case 'oldest':
        return sorted.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
          const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
          return dateA - dateB; // Oldest first
        });
      case 'hottest':
        return sorted.sort((a, b) => {
          const reactionsA = a.reactionsCount || 0;
          const reactionsB = b.reactionsCount || 0;
          return reactionsB - reactionsA; // Most reactions first
        });
      default:
        return sorted;
    }
  };

  // Handle filter change
  const handleFilterChange = (newFilter) => {
    setFilterType(newFilter);
    const sortedPosts = sortPosts(posts, newFilter);
    setPosts(sortedPosts);
  };

  // Create new post
  const createPost = async (postData) => {
    try {
      await apiCreatePost({
        text: postData.text,
        image: postData.image
      });

      // Refresh posts after creating new one
      await fetchPosts();
      return true;
    } catch (err) {
      console.error('Error creating post:', err);
      alert(`Không thể đăng bài: ${err.message || 'Có lỗi xảy ra'}`);
      return false;
    }
  };

  // Create comment (top-level or reply)
  const createComment = async (postId, commentText, parentCommentId = null) => {
    const text = commentText?.trim() || '';
    const images = parentCommentId 
      ? (replyImages[`${postId}-${parentCommentId}`] || [])
      : (commentImages[postId] || []);
    
    if (!text && images.length === 0) {
      alert('Vui lòng nhập nội dung hoặc chọn ảnh!');
      return false;
    }

    try {
      const newComment = await apiCreateComment({
        postId: postId,
        parentCommentId: parentCommentId,
        content: text,
        image: images.length > 0 ? images[0] : null // Only send first image for now
      });

      // Transform the new comment to match our format
      const transformedComment = {
        id: newComment.Id,
        authorId: newComment.AuthorId,
        authorName: newComment.AuthorName,
        authorAvatar: (newComment.AuthorAvatar && newComment.AuthorAvatar.trim() !== '') 
          ? newComment.AuthorAvatar 
          : '/img/stock_nimg.jpg',
        content: newComment.Content,
        image: newComment.Image,
        parentCommentId: newComment.ParentCommentId,
        createdAt: newComment.CreatedAt,
        reactionsCount: 0,
        reactionCounts: {},
        currentUserReaction: null,
        replies: []
      };

      // Clear inputs and images
      if (parentCommentId) {
        // Clear reply input and images
        setReplyInputs(prev => {
          const updated = { ...prev };
          delete updated[`${postId}-${parentCommentId}`];
          return updated;
        });
        setReplyImages(prev => {
          const updated = { ...prev };
          delete updated[`${postId}-${parentCommentId}`];
          return updated;
        });
        
        // Clear file input
        const ref = replyFileInputRefs.current[`${postId}-${parentCommentId}`];
        if (ref) {
          ref.value = '';
        }
      } else {
        // Clear the input and images
        setCommentInputs(prev => ({ ...prev, [postId]: '' }));
        setCommentImages(prev => ({ ...prev, [postId]: [] }));
        
        // Clear file input
        const ref = commentFileInputRefs.current[postId];
        if (ref) {
          ref.value = '';
        }
      }

      // Silently refresh comments from backend in background (no loading state)
      getCommentsByPostId(postId).then(comments => {
        const commentsArray = Array.isArray(comments) ? comments : [];
        const transformedComments = transformComments(commentsArray);
        
        setLoadedComments(prev => ({
          ...prev,
          [postId]: transformedComments
        }));
      }).catch(error => {
        console.error('Error refreshing comments after creating reply:', error);
        // If refresh fails, try to add locally as fallback
        if (parentCommentId) {
          const updateParentReplies = (comments, parentId, newReply) => {
            for (let i = 0; i < comments.length; i++) {
              if (comments[i].id === parentId) {
                const updated = [...comments];
                updated[i] = {
                  ...updated[i],
                  replies: [...(updated[i].replies || []), newReply]
                };
                return updated;
              }
              if (comments[i].replies && comments[i].replies.length > 0) {
                const updatedReplies = updateParentReplies(comments[i].replies, parentId, newReply);
                if (updatedReplies) {
                  const updated = [...comments];
                  updated[i] = {
                    ...updated[i],
                    replies: updatedReplies
                  };
                  return updated;
                }
              }
            }
            return null;
          };

          setLoadedComments(prev => {
            const updated = { ...prev };
            const postComments = [...(updated[postId] || [])];
            const updatedComments = updateParentReplies(postComments, parentCommentId, transformedComment);
            if (updatedComments) {
              updated[postId] = updatedComments;
            }
            return updated;
          });
        } else {
          setLoadedComments(prev => ({
            ...prev,
            [postId]: [...(prev[postId] || []), transformedComment]
          }));
        }
      });

      // Silently refresh posts in background to update comment count (no loading state)
      getAllPosts().then(postsData => {
        const transformedPosts = postsData
          .filter(post => {
            const postAuthorId = parseInt(post.PosterId || post.AuthorId || '0', 10);
            const currentUserIdNum = typeof userId === 'string' ? parseInt(userId, 10) : userId;
            return postAuthorId === currentUserIdNum;
          })
          .map(post => {
            // Parse PublicDate to Date object
            let createdAt = new Date();
            if (post.PublicDate) {
              const dateParts = post.PublicDate.split(' ');
              if (dateParts.length === 2) {
                const [datePart, timePart] = dateParts;
                const [day, month, year] = datePart.split('/');
                const [hour, minute] = timePart.split(':');
                createdAt = new Date(year, month - 1, day, hour, minute);
              }
            }
            
            // Process images - only filenames are supported
            let images = [];
            if (post.Images && post.Images.length > 0) {
              images = post.Images
                .filter(img => img && img.trim())
                .map(img => {
                  const imgName = img.trim();
                  
                  // Skip base64 images (old posts) - they are no longer supported
                  if (imgName.startsWith('data:image') || imgName.length > 200) {
                    return null; // Filter out old base64 images
                  }
                  
                  // Treat as filename - construct URLs
                  const publicUrl = (process.env.PUBLIC_URL || '').replace(/\/$/, '');
                  const candidates = [
                    `${backendUrl}/images/${imgName}`,
                    `${backendUrl}/img/uploads/${imgName}`,
                    `${publicUrl}/img/uploads/${imgName}`
                  ];
                  
                  return {
                    src: candidates[0] || '/img/stock_nimg.jpg',
                    candidates: candidates.length > 0 ? candidates : ['/img/stock_nimg.jpg']
                  };
                })
                .filter(img => img !== null); // Filter out null entries
            }
            const limitedImages = images.length > 0 ? [images[0]] : [];
            
            return {
              id: parseInt(post.PostId) || 0,
              username: post.PosterName || 'Unknown',
              authorId: parseInt(post.PosterId || post.AuthorId || '0', 10),
              avatar: '/img/stock_nimg.jpg',
              images: limitedImages,
              image: limitedImages.length > 0 ? limitedImages[0].src : null,
              text: post.PostContent || '',
              title: post.ArticleTitle || '',
              reaction: post.CurrentUserReaction || null,
              comments: post.Comments || [],
              createdAt: createdAt,
              commentsCount: post.Comments ? post.Comments.length : 0,
              reactionsCount: post.Likes ? post.Likes.length : 0,
              reactionCounts: post.ReactionCounts || {}
            };
          });
        const sortedPosts = sortPosts(transformedPosts, filterType);
        setPosts(sortedPosts);
      }).catch(err => {
        console.error('Error refreshing posts after comment:', err);
      });
      return true;
    } catch (err) {
      console.error('Error creating comment:', err);
      alert('Không thể bình luận. Vui lòng thử lại.');
      return false;
    }
  };

  // Create or update reaction
  const createReaction = async (targetType, targetId, reactionType) => {
    try {
      await apiCreateReaction({
        targetType: targetType,
        targetId: targetId,
        reactionType: reactionType
      });

      // Refresh posts to show updated reaction count
      await fetchPosts();
      return true;
    } catch (err) {
      console.error('Error creating reaction:', err);
      return false;
    }
  };

  // Delete reaction
  const deleteReaction = async (targetType, targetId) => {
    try {
      await apiDeleteReaction(targetType, targetId);

      // Refresh posts to show updated reaction count
      await fetchPosts();
      return true;
    } catch (err) {
      console.error('Error deleting reaction:', err);
      return false;
    }
  };

  // Load user info on component mount
  useEffect(() => {
    const loadUserInfo = async () => {
      // First try to get from localStorage (fast)
      const storedUserInfo = localStorage.getItem('userInfo');
      if (storedUserInfo) {
        try {
          const user = JSON.parse(storedUserInfo);
          console.log('Loaded userInfo from localStorage:', user);
          setUserInfo(user);
          if (user.Id || user.id) {
            const loadedUserId = user.Id || user.id;
            console.log('Setting userId from localStorage:', loadedUserId);
            setUserId(loadedUserId);
          }
        } catch (err) {
          console.error('Error parsing user info:', err);
        }
      } else {
        console.log('No userInfo found in localStorage');
      }

         // Then fetch fresh data from API to ensure we have the latest avatar
         // Only fetch if we don't have userInfo or if we want to refresh
         try {
           const currentUser = await getCurrentUser();
           if (currentUser) {
             console.log('Fetched current user:', currentUser);
             console.log('Avatar value:', currentUser.Avatar || currentUser.avatar);
             setUserInfo(currentUser);
             if (currentUser.Id || currentUser.id) {
               const fetchedUserId = currentUser.Id || currentUser.id;
               console.log('Setting userId from API:', fetchedUserId);
               setUserId(fetchedUserId);
             }
             // Update localStorage with fresh data
             localStorage.setItem('userInfo', JSON.stringify(currentUser));
           }
         } catch (err) {
           console.error('Error fetching current user:', err);
           // If API fails, keep using localStorage data - don't throw, just log
           // The component will continue to work with localStorage data
         }
       };

       loadUserInfo();
     }, []);

  // Load posts when userId is available
  useEffect(() => {
    // Only fetch posts if userId is set
    if (userId) {
      console.log('Fetching posts for userId:', userId);
      fetchPosts();
    }
  }, [userId]);

  // Utility functions
  const escapeHtml = (text) => {
    return text;
  };

  const getReactionIcon = (reaction) => {
    const icons = {
      'like': '👍',
      'dislike': '👎',
      'love': '❤️',
      'haha': '😂',
      'wow': '😮'
    };
    return reaction ? icons[reaction] : '👍';
  };

  const getReactionText = (reaction) => {
    const texts = {
      'like': 'Thích',
      'dislike': 'Không thích',
      'love': 'Thương',
      'haha': 'Haha',
      'wow': 'Wow'
    };
    return reaction ? texts[reaction] : 'Thích';
  };

  // Event handlers
  const handleReaction = async (postId, reactionType) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const currentReaction = post.reaction;
    
    // Optimistically update local state
    const updatePostReaction = (posts, postId, newReaction) => {
      return posts.map(p => {
        if (p.id === postId) {
          const oldReaction = p.reaction;
          let newReactionsCount = p.reactionsCount || 0;
          const newReactionCounts = { ...(p.reactionCounts || {}) };
          
          // Calculate new counts
          if (oldReaction) {
            // Remove old reaction
            newReactionsCount = Math.max(0, newReactionsCount - 1);
            if (newReactionCounts[oldReaction]) {
              newReactionCounts[oldReaction] = Math.max(0, newReactionCounts[oldReaction] - 1);
            }
          }
          
          if (newReaction) {
            // Add new reaction
            if (!oldReaction || oldReaction !== newReaction) {
              newReactionsCount += 1;
              newReactionCounts[newReaction] = (newReactionCounts[newReaction] || 0) + 1;
            }
          }
          
          return {
            ...p,
            reaction: newReaction,
            reactionsCount: newReactionsCount,
            reactionCounts: newReactionCounts
          };
        }
        return p;
      });
    };

    // Determine new reaction state
    let newReaction = null;
    if (reactionType === 'like') {
      if (currentReaction) {
        newReaction = null; // Delete reaction
      } else {
        newReaction = 'like'; // Create like
      }
    } else {
      if (currentReaction === reactionType) {
        newReaction = null; // Delete reaction
      } else {
        newReaction = reactionType; // Create/update reaction
      }
    }

    // Update UI immediately
    setPosts(prevPosts => {
      const updated = updatePostReaction(prevPosts, postId, newReaction);
      return sortPosts(updated, filterType);
    });

    // Make API call in background (non-blocking)
    if (newReaction) {
      createReaction('POST', postId, newReaction).catch(err => {
        console.error('Error creating reaction:', err);
        // Revert on error
        setPosts(prevPosts => {
          const updated = updatePostReaction(prevPosts, postId, currentReaction);
          return sortPosts(updated, filterType);
        });
      });
    } else {
      deleteReaction('POST', postId).catch(err => {
        console.error('Error deleting reaction:', err);
        // Revert on error
        setPosts(prevPosts => {
          const updated = updatePostReaction(prevPosts, postId, currentReaction);
          return sortPosts(updated, filterType);
        });
      });
    }
    
    // Silently refresh in background without blocking (non-blocking)
    getAllPosts().then(postsData => {
      const transformedPosts = postsData
        .filter(post => {
          const postAuthorId = parseInt(post.PosterId || post.AuthorId || '0', 10);
          const currentUserIdNum = typeof userId === 'string' ? parseInt(userId, 10) : userId;
          return postAuthorId === currentUserIdNum;
        })
        .map(post => ({
          id: parseInt(post.PostId) || 0,
          username: post.PosterName || 'Unknown',
          authorId: parseInt(post.PosterId || post.AuthorId || '0', 10),
          avatar: (post.AuthorAvatar && post.AuthorAvatar.trim() !== '') 
            ? post.AuthorAvatar 
            : '/img/stock_nimg.jpg',
          image: post.Image,
          text: post.Content,
          title: post.Title,
          reaction: post.CurrentUserReaction || null,
          comments: [],
          createdAt: post.CreatedAt,
          commentsCount: post.CommentsCount,
          reactionsCount: post.ReactionsCount || 0,
          reactionCounts: post.ReactionCounts || {}
        }));
      const sortedPosts = sortPosts(transformedPosts, filterType);
      setPosts(sortedPosts);
    }).catch(err => {
      console.error('Error refreshing posts:', err);
    });
  };

  // Helper function to transform comment from API response
  const transformComment = (comment) => {
    // Handle both PascalCase (from backend) and camelCase (from JSON serialization)
    // Check for replies in both cases
    let replies = comment.Replies || comment.replies;
    if (!replies) {
      replies = [];
    }
    
    // Debug logging
    if (replies && replies.length > 0) {
      console.log(`Comment ${comment.Id || comment.id} has ${replies.length} replies:`, replies);
    }
    
    // Process image - backend now returns filename, not base64
    const imageFileName = comment.Image || comment.image || null;
    let imageUrl = null;
    if (imageFileName) {
      // Skip base64 images (old comments) - they are no longer supported
      if (!imageFileName.startsWith('data:image') && imageFileName.length <= 200) {
        // Construct URL from filename
        imageUrl = `${backendUrl}/images/${imageFileName}`;
      }
    }
    
    const transformed = {
      id: comment.Id || comment.id,
      authorId: comment.AuthorId || comment.authorId,
      authorName: (() => {
        // Extract author name from nested Author object (raw Comment entity)
        const author = comment.Author || comment.author || null;
        return author?.Name || author?.name || comment.AuthorName || comment.authorName || 'Unknown';
      })(),
      authorAvatar: (() => {
        // Extract avatar from nested Author object (raw Comment entity)
        // Backend returns filename like "5cc3e441-95ed-4c64-bd06-e1371f6dff13.jpg"
        const author = comment.Author || comment.author || null;
        const avatarFileName = author?.Avatar || author?.avatar || comment.AuthorAvatar || comment.authorAvatar || null;
        if (avatarFileName && avatarFileName.trim() !== '') {
          // Skip base64 avatars (old data) - they are no longer supported
          // Also skip if it looks like a full URL (shouldn't happen, but defensive)
          if (!avatarFileName.startsWith('data:image') && 
              !avatarFileName.startsWith('http://') && 
              !avatarFileName.startsWith('https://') &&
              !avatarFileName.startsWith('/') &&
              avatarFileName.length <= 200) {
            // Construct URL from filename (same as post/comment images)
            // Filename should be like "5cc3e441-95ed-4c64-bd06-e1371f6dff13.jpg"
            return `${backendUrl}/images/${avatarFileName}`;
          }
        }
        return '/img/stock_nimg.jpg';
      })(),
      content: comment.Content || comment.content,
      image: imageUrl,
      parentCommentId: comment.ParentCommentId || comment.parentCommentId || null,
      createdAt: comment.CreatedAt || comment.createdAt,
      reactionsCount: comment.ReactionsCount || comment.reactionsCount || 0,
      reactionCounts: comment.ReactionCounts || comment.reactionCounts || {},
      currentUserReaction: comment.CurrentUserReaction || comment.currentUserReaction || null,
      replies: Array.isArray(replies) ? replies.map(transformComment) : []
    };
    
    return transformed;
  };

  // Helper function to transform nested comments structure
  const transformComments = (comments) => {
    return comments.map(transformComment);
  };

  // Handle comment reaction - same logic as post reactions
  const handleCommentReaction = async (postId, commentId, reactionType) => {
    // Find comment in nested structure
    const findAndUpdateComment = (comments, id, updateFn) => {
      for (let i = 0; i < comments.length; i++) {
        if (comments[i].id === id) {
          const updated = [...comments];
          updated[i] = updateFn(updated[i]);
          return updated;
        }
        if (comments[i].replies && comments[i].replies.length > 0) {
          const updatedReplies = findAndUpdateComment(comments[i].replies, id, updateFn);
          if (updatedReplies) {
            const updated = [...comments];
            updated[i] = {
              ...updated[i],
              replies: updatedReplies
            };
            return updated;
          }
        }
      }
      return null;
    };

    const comments = loadedComments[postId] || [];
    const comment = findAndUpdateComment(comments, commentId, c => c);
    if (!comment) return;

    const currentReaction = comment.currentUserReaction;
    
    // Determine new reaction state
    let newReaction = null;
    if (reactionType === 'like') {
      if (currentReaction) {
        newReaction = null; // Delete reaction
      } else {
        newReaction = 'like'; // Create like
      }
    } else {
      if (currentReaction === reactionType) {
        newReaction = null; // Delete reaction
      } else {
        newReaction = reactionType; // Create/update reaction
      }
    }

    // Update UI immediately
    const updatedComments = findAndUpdateComment(comments, commentId, (c) => {
      const oldReaction = c.currentUserReaction;
      let newReactionsCount = c.reactionsCount || 0;
      const newReactionCounts = { ...(c.reactionCounts || {}) };
      
      // Calculate new counts
      if (oldReaction) {
        newReactionsCount = Math.max(0, newReactionsCount - 1);
        if (newReactionCounts[oldReaction]) {
          newReactionCounts[oldReaction] = Math.max(0, newReactionCounts[oldReaction] - 1);
        }
      }
      
      if (newReaction) {
        if (!oldReaction || oldReaction !== newReaction) {
          newReactionsCount += 1;
          newReactionCounts[newReaction] = (newReactionCounts[newReaction] || 0) + 1;
        }
      }
      
      return {
        ...c,
        currentUserReaction: newReaction,
        reactionsCount: newReactionsCount,
        reactionCounts: newReactionCounts
      };
    });

    if (updatedComments) {
      setLoadedComments(prev => ({
        ...prev,
        [postId]: updatedComments
      }));
    }

    // Make API call in background (non-blocking)
    if (newReaction) {
      createReaction('COMMENT', commentId, newReaction).catch(err => {
        console.error('Error creating comment reaction:', err);
        // Revert on error
        const revertedComments = findAndUpdateComment(comments, commentId, (c) => ({
          ...c,
          currentUserReaction: currentReaction
        }));
        if (revertedComments) {
          setLoadedComments(prev => ({
            ...prev,
            [postId]: revertedComments
          }));
        }
      });
    } else {
      deleteReaction('COMMENT', commentId).catch(err => {
        console.error('Error deleting comment reaction:', err);
        // Revert on error
        const revertedComments = findAndUpdateComment(comments, commentId, (c) => ({
          ...c,
          currentUserReaction: currentReaction
        }));
        if (revertedComments) {
          setLoadedComments(prev => ({
            ...prev,
            [postId]: revertedComments
          }));
        }
      });
    }
    
    // Silently refresh in background without blocking (non-blocking)
    getCommentsByPostId(postId).then(freshComments => {
      const commentsArray = Array.isArray(freshComments) ? freshComments : [];
      const transformedComments = transformComments(commentsArray);
      setLoadedComments(prev => ({
        ...prev,
        [postId]: transformedComments
      }));
    }).catch(err => {
      console.error('Error refreshing comments:', err);
    });
  };

  const showReactionMenu = (postId) => {
    const timeoutId = setTimeout(() => {
      const menu = document.getElementById(`reaction-menu-${postId}`);
      if (menu) {
        menu.classList.add('visible');
      }
    }, 300); // Reduced delay for better responsiveness

    setHoverTimeouts(prev => ({ ...prev, [postId]: timeoutId }));
  };

  const hideReactionMenu = (postId) => {
    const timeoutId = hoverTimeouts[postId];
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const menu = document.getElementById(`reaction-menu-${postId}`);
    if (menu) {
      menu.classList.remove('visible');
    }
    // Clear the timeout from state
    setHoverTimeouts(prev => {
      const newTimeouts = { ...prev };
      delete newTimeouts[postId];
      return newTimeouts;
    });
  };

  // Show comment reaction menu
  const showCommentReactionMenu = (postId, commentId) => {
    const menuId = `comment-reaction-menu-${postId}-${commentId}`;
    
    // Clear any pending hide timeout
    const hideTimeoutId = commentHideTimeouts[menuId];
    if (hideTimeoutId) {
      clearTimeout(hideTimeoutId);
      setCommentHideTimeouts(prev => {
        const newTimeouts = { ...prev };
        delete newTimeouts[menuId];
        return newTimeouts;
      });
    }

    // Clear any existing show timeout
    const existingTimeoutId = commentHoverTimeouts[menuId];
    if (existingTimeoutId) {
      clearTimeout(existingTimeoutId);
    }

    // Show menu immediately if it's already visible, otherwise show after delay
    const menu = document.getElementById(menuId);
    if (menu && menu.classList.contains('visible')) {
      // Already visible, do nothing
      return;
    }

    const timeoutId = setTimeout(() => {
      const menu = document.getElementById(menuId);
      if (menu) {
        menu.classList.add('visible');
      }
    }, 200); // Reduced delay for faster response

    setCommentHoverTimeouts(prev => ({ ...prev, [menuId]: timeoutId }));
  };

  // Hide comment reaction menu
  const hideCommentReactionMenu = (postId, commentId) => {
    const menuId = `comment-reaction-menu-${postId}-${commentId}`;
    
    // Clear any pending show timeout
    const showTimeoutId = commentHoverTimeouts[menuId];
    if (showTimeoutId) {
      clearTimeout(showTimeoutId);
      setCommentHoverTimeouts(prev => {
        const newTimeouts = { ...prev };
        delete newTimeouts[menuId];
        return newTimeouts;
      });
    }

    // Add delay before hiding to allow moving mouse to menu
    const hideTimeoutId = setTimeout(() => {
      const menu = document.getElementById(menuId);
      if (menu) {
        menu.classList.remove('visible');
      }
      setCommentHideTimeouts(prev => {
        const newTimeouts = { ...prev };
        delete newTimeouts[menuId];
        return newTimeouts;
      });
    }, 300); // Delay before hiding to allow mouse movement

    setCommentHideTimeouts(prev => ({ ...prev, [menuId]: hideTimeoutId }));
  };

  // Get reaction icon for comment
  const getCommentReactionIcon = (reaction) => {
    if (!reaction) return '👍';
    const icons = {
      'like': '👍',
      'dislike': '👎',
      'love': '❤️',
      'haha': '😂',
      'wow': '😮',
      'angry': '😠'
    };
    return icons[reaction] || '👍';
  };

  // Get reaction text for comment
  const getCommentReactionText = (reaction) => {
    if (!reaction) return 'Thích';
    const texts = {
      'like': 'Thích',
      'dislike': 'Không thích',
      'love': 'Thương thương',
      'haha': 'Haha',
      'wow': 'Wow',
      'angry': 'Tức giận'
    };
    return texts[reaction] || 'Thích';
  };

  const toggleCommentBox = async (postId) => {
    const isVisible = visibleComments[postId];

    // If comments are not visible and not loaded yet, fetch them
    if (!isVisible && !loadedComments[postId]) {
      try {
        const comments = await getCommentsByPostId(postId);
        // Handle both array and empty/null responses
        const commentsArray = Array.isArray(comments) ? comments : [];
        console.log('Fetched comments from API:', commentsArray);
        console.log('First comment structure:', commentsArray[0]);
        if (commentsArray[0]) {
          console.log('First comment has Replies property:', commentsArray[0].Replies);
          console.log('First comment has replies property:', commentsArray[0].replies);
        }
        const transformedComments = transformComments(commentsArray);
        console.log('Transformed comments:', transformedComments);
        if (transformedComments[0]) {
          console.log('First transformed comment has replies:', transformedComments[0].replies);
        }

        setLoadedComments(prev => ({
          ...prev,
          [postId]: transformedComments
        }));
      } catch (error) {
        console.error('Error fetching comments:', error);
        // Set empty array on error so UI doesn't break
        setLoadedComments(prev => ({
          ...prev,
          [postId]: []
        }));
      }
    }

    setVisibleComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleCommentInputChange = (postId, value) => {
    setCommentInputs(prev => ({
      ...prev,
      [postId]: value
    }));
  };

  const addComment = async (postId) => {
    const commentText = commentInputs[postId]?.trim();
    if (commentText) {
      const success = await createComment(postId, commentText);
      if (success) {
        setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      }
    }
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const newImages = [];

    files.forEach(file => {
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          newImages.push(e.target.result);
          if (newImages.length === files.length) {
            setPendingImages(newImages);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (index) => {
    setPendingImages(prev => prev.filter((_, i) => i !== index));
    // Update file input
    const dt = new DataTransfer();
    const files = Array.from(fileInputRef.current.files);
    files.splice(index, 1);
    files.forEach(file => dt.items.add(file));
    fileInputRef.current.files = dt.files;
  };

  // Handle comment image upload
  const handleCommentImageUpload = (postId, event) => {
    const files = Array.from(event.target.files);
    const newImages = [];
    files.forEach(file => {
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          newImages.push(e.target.result);
          if (newImages.length === files.length) {
            setCommentImages(prev => ({
              ...prev,
              [postId]: [...(prev[postId] || []), ...newImages]
            }));
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeCommentImage = (postId, index) => {
    setCommentImages(prev => ({
      ...prev,
      [postId]: (prev[postId] || []).filter((_, i) => i !== index)
    }));
    // Update file input
    const ref = commentFileInputRefs.current[postId];
    if (ref) {
      const dt = new DataTransfer();
      const files = Array.from(ref.files);
      files.splice(index, 1);
      files.forEach(file => dt.items.add(file));
      ref.files = dt.files;
    }
  };

  // Handle reply image upload
  const handleReplyImageUpload = (postId, commentId, event) => {
    const files = Array.from(event.target.files);
    const newImages = [];
    files.forEach(file => {
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          newImages.push(e.target.result);
          if (newImages.length === files.length) {
            setReplyImages(prev => ({
              ...prev,
              [`${postId}-${commentId}`]: [...(prev[`${postId}-${commentId}`] || []), ...newImages]
            }));
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeReplyImage = (postId, commentId, index) => {
    setReplyImages(prev => ({
      ...prev,
      [`${postId}-${commentId}`]: (prev[`${postId}-${commentId}`] || []).filter((_, i) => i !== index)
    }));
    // Update file input
    const ref = replyFileInputRefs.current[`${postId}-${commentId}`];
    if (ref) {
      const dt = new DataTransfer();
      const files = Array.from(ref.files);
      files.splice(index, 1);
      files.forEach(file => dt.items.add(file));
      ref.files = dt.files;
    }
  };

  // Delete comment handler
  const handleDeleteComment = async (postId, commentId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) {
      return;
    }

    console.log('Deleting comment:', { postId, commentId, commentIdType: typeof commentId });
    
    // Ensure commentId is a number
    const numericCommentId = typeof commentId === 'string' ? parseInt(commentId, 10) : commentId;
    if (isNaN(numericCommentId)) {
      console.error('Invalid comment ID:', commentId);
      alert('ID bình luận không hợp lệ');
      return;
    }

    try {
      // Optimistically remove from UI
      setLoadedComments(prev => {
        const removeComment = (comments, targetId) => {
          return comments
            .filter(c => {
              // Compare both as numbers to handle string/number mismatches
              const cId = typeof c.id === 'string' ? parseInt(c.id, 10) : c.id;
              const tId = typeof targetId === 'string' ? parseInt(targetId, 10) : targetId;
              return cId !== tId;
            })
            .map(c => ({
              ...c,
              replies: c.replies ? removeComment(c.replies, targetId) : []
            }));
        };

        const updated = { ...prev };
        if (updated[postId]) {
          updated[postId] = removeComment(updated[postId], numericCommentId);
        }
        return updated;
      });

      // Delete via API
      await apiDeleteComment(numericCommentId);

      // Silently refresh comments from backend in background
      getCommentsByPostId(postId).then(comments => {
        const commentsArray = Array.isArray(comments) ? comments : [];
        const transformedComments = transformComments(commentsArray);
        setLoadedComments(prev => ({
          ...prev,
          [postId]: transformedComments
        }));
      }).catch(error => {
        console.error('Error refreshing comments after delete:', error);
      });

      // Silently refresh posts to update comment count
      getAllPosts().then(postsData => {
        const transformedPosts = postsData
          .filter(post => post.AuthorId === userId)
          .map(post => ({
            id: post.Id,
            username: post.AuthorName,
            authorId: post.AuthorId,
            avatar: (post.AuthorAvatar && post.AuthorAvatar.trim() !== '') 
              ? post.AuthorAvatar 
              : '/img/stock_nimg.jpg',
            image: post.Image,
            text: post.Content,
            title: post.Title,
            reaction: post.CurrentUserReaction || null,
            comments: [],
            createdAt: post.CreatedAt,
            commentsCount: post.CommentsCount,
            reactionsCount: post.ReactionsCount || 0,
            reactionCounts: post.ReactionCounts || {}
          }));
        const sortedPosts = sortPosts(transformedPosts, filterType);
        setPosts(sortedPosts);
      }).catch(err => {
        console.error('Error refreshing posts after comment delete:', err);
      });
    } catch (err) {
      console.error('Error deleting comment:', err);
      alert(`Không thể xóa bình luận: ${err.message || 'Có lỗi xảy ra'}`);
      // Revert optimistic update on error - reload comments
      getCommentsByPostId(postId).then(comments => {
        const commentsArray = Array.isArray(comments) ? comments : [];
        const transformedComments = transformComments(commentsArray);
        setLoadedComments(prev => ({
          ...prev,
          [postId]: transformedComments
        }));
      }).catch(error => {
        console.error('Error reloading comments after delete error:', error);
      });
    }
  };

  // Toggle reply box visibility
  const toggleReplyBox = (postId, commentId, commentAuthorName) => {
    const key = `${postId}-${commentId}`;
    const isVisible = visibleReplies[key];
    
    setVisibleReplies(prev => ({
      ...prev,
      [key]: !isVisible
    }));
    
    // If opening the reply box, prefill with @username
    if (!isVisible && commentAuthorName) {
      setReplyInputs(prev => ({
        ...prev,
        [key]: `@${commentAuthorName} `
      }));
    }
  };

  // Add reply to a comment
  const addReply = async (postId, commentId) => {
    const replyText = replyInputs[`${postId}-${commentId}`]?.trim();
    if (replyText || (replyImages[`${postId}-${commentId}`] && replyImages[`${postId}-${commentId}`].length > 0)) {
      const success = await createComment(postId, replyText, commentId);
      if (success) {
        setReplyInputs(prev => {
          const updated = { ...prev };
          delete updated[`${postId}-${commentId}`];
          return updated;
        });
        setVisibleReplies(prev => ({
          ...prev,
          [`${postId}-${commentId}`]: false
        }));
      }
    }
  };

  const handleReplyInputChange = (postId, commentId, value) => {
    setReplyInputs(prev => ({
      ...prev,
      [`${postId}-${commentId}`]: value
    }));
  };

  // Delete post handler
  const handleDeletePost = async (postId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài đăng này?')) {
      return;
    }

    console.log('Deleting post with ID:', postId, 'Type:', typeof postId);
    
    // Optimistically remove from UI first
    setPosts(prevPosts => prevPosts.filter(p => p.id !== postId));

    try {
      await apiDeletePost(postId);
      // Post is already removed from UI, no need to refresh
      // The optimistic update is sufficient
    } catch (err) {
      console.error('Error deleting post:', err);
      // Revert optimistic update on error - restore the post
      fetchPosts();
      alert(`Không thể xóa bài đăng: ${err.message || 'Có lỗi xảy ra'}`);
    }
  };

  const handlePostSubmit = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('handlePostSubmit called');
    const text = newPostText.trim();
    if (!text && pendingImages.length === 0) {
      alert('Vui lòng nhập nội dung hoặc chọn ảnh!');
      return;
    }

    console.log('Submitting post with text:', text, 'and image:', pendingImages.length > 0);
    
    try {
      const success = await createPost({
        text: text,
        image: pendingImages.length > 0 ? pendingImages[0] : null
      });

      if (success) {
        console.log('Post created successfully');
        setNewPostText('');
        setPendingImages([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        console.log('Post creation returned false');
      }
    } catch (err) {
      console.error('Error in handlePostSubmit:', err);
      alert(`Không thể đăng bài: ${err.message || 'Có lỗi xảy ra'}`);
    }
  };

  return (
    <div className="social-media-page">
      {/* Header */}
      <Header 
        showMenuButton={true}
        onMenuToggle={toggleSidebar}
        sidebarActive={sidebarActive}
      />

      <div className="feed-wrapper">
        {/* Sidebar Navigation */}
        <aside className={`sidebar ${sidebarActive ? 'active' : ''}`} role="navigation" aria-label="Menu chính">
          <nav>
            <ul>
              {userInfo && (userInfo.RoleId === 2 || userInfo.roleId === 2) ? (
                <>
                  <li><a href="/" className="sidebar-select" aria-label="Trang chủ"><span>🏠</span> Trang chủ</a></li>
                  <li><a href="/service-manager" className="sidebar-select" aria-label="Quản lý dịch vụ"><span>⚙️</span> Quản lý dịch vụ</a></li>
                  <li><a href="/service-combo-manager" className="sidebar-select" aria-label="Quản lý combo dịch vụ"><span>📦</span> Quản lý combo dịch vụ</a></li>
                  <li><a href="/social-media" className="sidebar-select" aria-label="Mạng xã hội"><span>📱</span> Mạng xã hội</a></li>
                  <li><a href="#" className="sidebar-select" aria-label="Hỗ trợ"><span>👤</span> Hỗ trợ</a></li>
                  <li><a href="#" className="sidebar-select" aria-label="Chat"><span>💬</span> Chat</a></li>
                  <li className="sidebar-logout"><a href="#" className="sidebar-select sidebar-logout-link" aria-label="Đăng xuất" onClick={(e) => { e.preventDefault(); localStorage.removeItem('token'); localStorage.removeItem('userInfo'); window.location.href = '/login'; }}><span>🔌</span> Đăng xuất</a></li>
                </>
              ) : (
                <>
                  <li><a href="/your-posts" className="sidebar-select" aria-label="Bài viết của bạn">Bài viết của bạn</a></li>
                  <li><a href="/social-media" className="sidebar-select" aria-label="Mạng xã hội">Mạng xã hội</a></li>
                  <li><a href="#" className="sidebar-select" aria-label="Hỗ trợ">Hỗ trợ</a></li>
                  <li><a href="#" className="sidebar-select" aria-label="Chat">Chat</a></li>
                  <li className="sidebar-logout"><a href="#" className="sidebar-select sidebar-logout-link" aria-label="Đăng xuất" onClick={(e) => { e.preventDefault(); localStorage.removeItem('token'); localStorage.removeItem('userInfo'); window.location.href = '/login'; }}>Đăng xuất</a></li>
                </>
              )}
            </ul>
          </nav>
        </aside>

        {/* Left Sidebar - User Profile */}
        <div className="left-sidebar">
          <img 
            src={(() => {
              // Process avatar - backend returns filename like "5cc3e441-95ed-4c64-bd06-e1371f6dff13.jpg"
              const backendUrl = "http://localhost:5002";
              const avatarFileName = userInfo?.Avatar || userInfo?.avatar || null;
              if (avatarFileName && avatarFileName.trim() !== '') {
                // Skip base64 avatars (old data) - they are no longer supported
                // Also skip if it looks like a full URL (shouldn't happen, but defensive)
                if (!avatarFileName.startsWith('data:image') && 
                    !avatarFileName.startsWith('http://') && 
                    !avatarFileName.startsWith('https://') &&
                    !avatarFileName.startsWith('/') &&
                    avatarFileName.length <= 200) {
                  // Construct URL from filename (same as post/comment images)
                  // Filename should be like "5cc3e441-95ed-4c64-bd06-e1371f6dff13.jpg"
                  return `${backendUrl}/images/${avatarFileName}`;
                }
              }
              return "/img/stock_nimg.jpg";
            })()}
            alt="Ảnh đại diện" 
            className="sidebar-avatar"
            onError={(e) => {
              // Extract just the filename from the URL (last part after /)
              const currentSrc = e.target.src;
              const urlParts = currentSrc.split('/');
              const filename = urlParts[urlParts.length - 1];
              
              // Only try fallback if we have a valid filename (not a full URL, not the default)
              if (filename && filename !== 'stock_nimg.jpg' && !filename.includes('http://') && !filename.includes('://') && filename.length < 100) {
                const candidates = [
                  `http://localhost:5002/img/uploads/${filename}`,
                  `/img/uploads/${filename}`,
                  '/img/stock_nimg.jpg'
                ];
                const currentIdx = candidates.findIndex(c => currentSrc === c || currentSrc.includes(c));
                const nextIdx = currentIdx + 1;
                if (nextIdx < candidates.length) {
                  e.target.src = candidates[nextIdx];
                } else {
                  e.target.src = '/img/stock_nimg.jpg';
                }
              } else {
                e.target.src = '/img/stock_nimg.jpg';
              }
            }}
          />
          <div className="sidebar-name">
            {userInfo?.Name || userInfo?.name || 'User'}
          </div>
          <button className="sidebar-button" onClick={() => navigate('/social-media')}>📝 Mạng xã hội</button>
          <button className="sidebar-button" onClick={() => navigate('/')}>🏠 Về trang chủ</button>
        </div>

      {/* Main Feed Section */}
      <div className="main-feed-section">
        {/* Filter Dropdown */}
        <div className="post-filter-container">
          <select 
            className="post-filter"
            value={filterType}
            onChange={(e) => handleFilterChange(e.target.value)}
          >
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="hottest">Nổi bật</option>
          </select>
        </div>

        {/* Error State */}
        {error && (
          <div className="error-state">
            <p>{error}</p>
            <button onClick={fetchPosts}>Thử lại</button>
          </div>
        )}

        {/* Feed Container */}
        <div id="feed-list">
          {!loading && !error && posts.map(post => (
            <div key={post.id} className="post-card">
              <div className="post-top">
                <img 
                  src={post.avatar || "/img/stock_nimg.jpg"} 
                  alt="avatar" 
                  className="post-avatar"
                  onError={(e) => {
                    // Extract just the filename from the URL (last part after /)
                    const currentSrc = e.target.src;
                    const urlParts = currentSrc.split('/');
                    const filename = urlParts[urlParts.length - 1];
                    
                    // Only try fallback if we have a valid filename (not a full URL, not the default)
                    if (filename && filename !== 'stock_nimg.jpg' && !filename.includes('http://') && !filename.includes('://') && filename.length < 100) {
                      const candidates = [
                        `http://localhost:5002/img/uploads/${filename}`,
                        `/img/uploads/${filename}`,
                        '/img/stock_nimg.jpg'
                      ];
                      const currentIdx = candidates.findIndex(c => currentSrc === c || currentSrc.includes(c));
                      const nextIdx = currentIdx + 1;
                      if (nextIdx < candidates.length) {
                        e.target.src = candidates[nextIdx];
                      } else {
                        e.target.src = '/img/stock_nimg.jpg';
                      }
                    } else {
                      e.target.src = '/img/stock_nimg.jpg';
                    }
                  }}
                />
                <span className="post-username">{post.username}</span>
                <button 
                  className="post-delete-btn"
                  onClick={() => handleDeletePost(post.id)}
                  title="Xóa bài đăng"
                >
                  🗑️
                </button>
              </div>
              <div className="post-content">
                {post.text && (
                  <div style={{ margin: '0.6rem 0 0.3rem 0.1rem' }}>
                    {escapeHtml(post.text)}
                  </div>
                )}
              </div>
              {post.images && post.images.length > 0 ? (
                <div className="post-images">
                  {post.images.map((imgObj, idx) => {
                    const onImgError = (e) => {
                      try {
                        const list = JSON.parse(e.target.dataset.candidates || '[]');
                        const currentIdx = parseInt(e.target.dataset.idx || '0', 10);
                        const nextIdx = currentIdx + 1;
                        if (nextIdx < list.length) {
                          e.target.dataset.idx = String(nextIdx);
                          e.target.src = list[nextIdx];
                        } else {
                          e.target.src = '/img/stock_nimg.jpg';
                        }
                      } catch {
                        e.target.src = '/img/stock_nimg.jpg';
                      }
                    };
                    
                    return (
                      <img 
                        key={idx} 
                        src={imgObj.src} 
                        data-candidates={JSON.stringify(imgObj.candidates)}
                        data-idx="0"
                        className="post-image" 
                        alt={`Bài đăng ${idx + 1}`}
                        onError={onImgError}
                      />
                    );
                  })}
                </div>
              ) : post.image ? (
                <img 
                  src={post.image} 
                  className="post-image" 
                  alt="Bài đăng"
                  onError={(e) => {
                    e.target.src = '/img/stock_nimg.jpg';
                  }}
                />
              ) : null}
              <div className="post-actions">
                <div
                  className="reaction-container"
                  onMouseEnter={() => showReactionMenu(post.id)}
                  onMouseLeave={() => hideReactionMenu(post.id)}
                >
                  <button
                    className={`action-btn${post.reaction ? ' reacted' : ''}`}
                    onClick={() => handleReaction(post.id, 'like')}
                  >
                    <span className="reaction-icon">{getReactionIcon(post.reaction)}</span> {getReactionText(post.reaction)}
                  </button>
                  <div 
                    className="reaction-menu" 
                    id={`reaction-menu-${post.id}`}
                    onMouseEnter={() => showReactionMenu(post.id)}
                    onMouseLeave={() => hideReactionMenu(post.id)}
                  >
                    <button className="reaction-option" onClick={() => handleReaction(post.id, 'like')} title="Thích">👍</button>
                    <button className="reaction-option" onClick={() => handleReaction(post.id, 'dislike')} title="Không thích">👎</button>
                    <button className="reaction-option" onClick={() => handleReaction(post.id, 'love')} title="Thương thương">❤️</button>
                    <button className="reaction-option" onClick={() => handleReaction(post.id, 'haha')} title="Haha">😂</button>
                    <button className="reaction-option" onClick={() => handleReaction(post.id, 'wow')} title="Wow">😮</button>
                  </div>
                </div>
                <button className="action-btn" onClick={() => toggleCommentBox(post.id)}>
                  💬 Bình luận ({post.commentsCount || 0})
                </button>
              </div>
              {formatReactionCounts(post.reactionCounts) && (
                <div className="reaction-counts-text">
                  {formatReactionCounts(post.reactionCounts)}
                </div>
              )}
              <div className="comment-section" style={{ display: visibleComments[post.id] ? 'block' : 'none' }}>
                {/* Comment Input with Avatar */}
                <div className="comment-input-container">
                  <img 
                    src={
                      (userInfo?.Avatar && userInfo.Avatar.trim() !== '') 
                        ? userInfo.Avatar 
                        : (userInfo?.avatar && userInfo.avatar.trim() !== '')
                          ? userInfo.avatar
                          : "/img/stock_nimg.jpg"
                    } 
                    alt="Ảnh đại diện" 
                    className="comment-input-avatar"
                    onError={(e) => {
                      e.target.src = "/img/stock_nimg.jpg";
                    }}
                  />
                  <div className="comment-input-wrapper">
                    <div className="comment-input-row">
                      <input
                        type="text"
                        className="comment-input"
                        maxLength="500"
                        placeholder="Viết bình luận..."
                        value={commentInputs[post.id] || ''}
                        onChange={(e) => handleCommentInputChange(post.id, e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addComment(post.id)}
                      />
                      <div className="comment-input-actions">
                        <label htmlFor={`comment-photo-${post.id}`} className="comment-photo-label" title="Thêm ảnh">
                          🖼️
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          id={`comment-photo-${post.id}`}
                          className="comment-photo-input"
                          ref={(el) => {
                            if (el) commentFileInputRefs.current[post.id] = el;
                          }}
                          onChange={(e) => handleCommentImageUpload(post.id, e)}
                        />
                        <button 
                          className="comment-send-btn" 
                          onClick={() => addComment(post.id)}
                          disabled={(!commentInputs[post.id]?.trim() && (!commentImages[post.id] || commentImages[post.id].length === 0))}
                        >
                          Gửi
                        </button>
                      </div>
                    </div>
                    {/* Comment Image Preview */}
                    {commentImages[post.id] && commentImages[post.id].length > 0 && (
                      <div className="comment-image-preview-container">
                        {commentImages[post.id].map((imageData, index) => (
                          <div key={index} className="comment-image-preview-item">
                            <img src={imageData} className="comment-image-preview" alt={`Preview ${index + 1}`} />
                            <button
                              className="comment-image-remove-btn"
                              onClick={() => removeCommentImage(post.id, index)}
                              title="Xóa ảnh"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Comments List */}
                <div className="comment-list">
                  {/* Recursive component to render comments and replies */}
                  {((loadedComments[post.id] || []).map((comment, idx) => {
                    const renderComment = (comment, isReply = false, isReplyToReply = false) => {
                      return (
                      <div key={comment.id} className={`comment-item ${isReply ? 'comment-reply' : ''}`}>
                        <img 
                          src={comment.authorAvatar || comment.AuthorAvatar || "/img/stock_nimg.jpg"}
                          alt={comment.authorName || comment.AuthorName || "avatar"} 
                          className="comment-avatar"
                          onError={(e) => {
                            // Extract just the filename from the URL (last part after /)
                            const currentSrc = e.target.src;
                            const urlParts = currentSrc.split('/');
                            const filename = urlParts[urlParts.length - 1];
                            
                            // Only try fallback if we have a valid filename (not a full URL, not the default)
                            if (filename && filename !== 'stock_nimg.jpg' && !filename.includes('http://') && !filename.includes('://') && filename.length < 100) {
                              const candidates = [
                                `http://localhost:5002/img/uploads/${filename}`,
                                `/img/uploads/${filename}`,
                                '/img/stock_nimg.jpg'
                              ];
                              const currentIdx = candidates.findIndex(c => currentSrc === c || currentSrc.includes(c));
                              const nextIdx = currentIdx + 1;
                              if (nextIdx < candidates.length) {
                                e.target.src = candidates[nextIdx];
                              } else {
                                e.target.src = '/img/stock_nimg.jpg';
                              }
                            } else {
                              e.target.src = '/img/stock_nimg.jpg';
                            }
                          }}
                        />
                        <div className="comment-content-wrapper">
                          <div className="comment-bubble">
                            <div className="comment-author-name">{comment.authorName || comment.AuthorName || 'Unknown'}</div>
                            <div className="comment-text">{escapeHtml(comment.content)}</div>
                            {comment.image && (
                              <img 
                                src={comment.image} 
                                className="comment-image" 
                                alt="Comment image"
                                onError={(e) => {
                                  // Try fallback URLs if main URL fails
                                  const imgName = comment.image?.replace(`${backendUrl}/images/`, '') || '';
                                  if (imgName) {
                                    const candidates = [
                                      `${backendUrl}/img/uploads/${imgName}`,
                                      `/img/uploads/${imgName}`,
                                      '/img/stock_nimg.jpg'
                                    ];
                                    const currentSrc = e.target.src;
                                    const currentIdx = candidates.findIndex(c => currentSrc.includes(c.replace(backendUrl, '').replace(/^\//, '')));
                                    const nextIdx = currentIdx + 1;
                                    if (nextIdx < candidates.length) {
                                      e.target.src = candidates[nextIdx];
                                    } else {
                                      e.target.src = '/img/stock_nimg.jpg';
                                    }
                                  } else {
                                    e.target.src = '/img/stock_nimg.jpg';
                                  }
                                }}
                              />
                            )}
                          </div>
                          <div className="comment-actions">
                            <div
                              className="comment-reaction-container"
                              onMouseEnter={() => showCommentReactionMenu(post.id, comment.id)}
                              onMouseLeave={() => hideCommentReactionMenu(post.id, comment.id)}
                            >
                              <button 
                                className={`comment-action-btn ${comment.currentUserReaction ? 'reacted' : ''}`}
                                onClick={() => handleCommentReaction(post.id, comment.id, 'like')}
                              >
                                <span className="reaction-icon">{getCommentReactionIcon(comment.currentUserReaction)}</span> {getCommentReactionText(comment.currentUserReaction)}
                              </button>
                              <div 
                                className="comment-reaction-menu" 
                                id={`comment-reaction-menu-${post.id}-${comment.id}`}
                                onMouseEnter={() => showCommentReactionMenu(post.id, comment.id)}
                                onMouseLeave={() => hideCommentReactionMenu(post.id, comment.id)}
                              >
                                <button className="reaction-option" onClick={() => handleCommentReaction(post.id, comment.id, 'like')} title="Thích">👍</button>
                                <button className="reaction-option" onClick={() => handleCommentReaction(post.id, comment.id, 'dislike')} title="Không thích">👎</button>
                                <button className="reaction-option" onClick={() => handleCommentReaction(post.id, comment.id, 'love')} title="Thương thương">❤️</button>
                                <button className="reaction-option" onClick={() => handleCommentReaction(post.id, comment.id, 'haha')} title="Haha">😂</button>
                                <button className="reaction-option" onClick={() => handleCommentReaction(post.id, comment.id, 'wow')} title="Wow">😮</button>
                                <button className="reaction-option" onClick={() => handleCommentReaction(post.id, comment.id, 'angry')} title="Tức giận">😠</button>
                              </div>
                            </div>
                            <button 
                              className="comment-action-btn"
                              onClick={() => toggleReplyBox(post.id, comment.id, comment.authorName)}
                            >
                              Phản hồi
                            </button>
                            {comment.authorId === userId && (
                              <button 
                                className="comment-action-btn comment-delete-btn"
                                onClick={() => handleDeleteComment(post.id, comment.id)}
                                title="Xóa bình luận"
                              >
                                Xóa
                              </button>
                            )}
                          </div>
                          
                          {/* Reply box - show for both top-level comments and replies */}
                          {visibleReplies[`${post.id}-${comment.id}`] && (
                            <div className="reply-input-container">
                              <img 
                                src={
                                  (userInfo?.Avatar && userInfo.Avatar.trim() !== '') 
                                    ? userInfo.Avatar 
                                    : (userInfo?.avatar && userInfo.avatar.trim() !== '')
                                      ? userInfo.avatar
                                      : "/img/stock_nimg.jpg"
                                } 
                                alt="Ảnh đại diện" 
                                className="comment-input-avatar"
                                onError={(e) => {
                                  e.target.src = "/img/stock_nimg.jpg";
                                }}
                              />
                              <div className="comment-input-wrapper">
                                <div className="comment-input-row">
                                  <input
                                    type="text"
                                    className="comment-input"
                                    maxLength="500"
                                    placeholder="Viết phản hồi..."
                                    value={replyInputs[`${post.id}-${comment.id}`] || ''}
                                    onChange={(e) => handleReplyInputChange(post.id, comment.id, e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addReply(post.id, comment.id)}
                                  />
                                  <div className="comment-input-actions">
                                    <label htmlFor={`reply-photo-${post.id}-${comment.id}`} className="comment-photo-label" title="Thêm ảnh">
                                      🖼️
                                    </label>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      id={`reply-photo-${post.id}-${comment.id}`}
                                      className="comment-photo-input"
                                      ref={(el) => {
                                        if (el) replyFileInputRefs.current[`${post.id}-${comment.id}`] = el;
                                      }}
                                      onChange={(e) => handleReplyImageUpload(post.id, comment.id, e)}
                                    />
                                    <button 
                                      className="comment-send-btn" 
                                      onClick={() => addReply(post.id, comment.id)}
                                      disabled={(!replyInputs[`${post.id}-${comment.id}`]?.trim() && (!replyImages[`${post.id}-${comment.id}`] || replyImages[`${post.id}-${comment.id}`].length === 0))}
                                    >
                                      Gửi
                                    </button>
                                  </div>
                                </div>
                                {/* Reply Image Preview */}
                                {replyImages[`${post.id}-${comment.id}`] && replyImages[`${post.id}-${comment.id}`].length > 0 && (
                                  <div className="comment-image-preview-container">
                                    {replyImages[`${post.id}-${comment.id}`].map((imageData, index) => (
                                      <div key={index} className="comment-image-preview-item">
                                        <img src={imageData} className="comment-image-preview" alt={`Preview ${index + 1}`} />
                                        <button
                                          className="comment-image-remove-btn"
                                          onClick={() => removeReplyImage(post.id, comment.id, index)}
                                          title="Xóa ảnh"
                                        >
                                          ×
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Render replies */}
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="comment-replies">
                              {comment.replies.map(reply => renderComment(reply, true, isReply))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                    };

                    return renderComment(comment, false);
                  }))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
};

export default YourSocialMediaPost;