import { memo, useEffect, useState, useCallback, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { musicApi } from '@/services/musicApi';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.5;

type Comment = {
  id: string;
  trackId: string;
  userId: string;
  comment: string;
  createdAt: string;
  updatedAt: string;
  displayName: string;
};

type CommentModalProps = {
  visible: boolean;
  trackId: string;
  onClose: () => void;
};

function CommentModalComponent({ visible, trackId, onClose }: CommentModalProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Animation for slide up/down
  const translateY = useRef(new Animated.Value(0)).current;
  const lastGesture = useRef(0);

  // Pan responder for dragging
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to vertical gestures
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        lastGesture.current = (translateY as any)._value;
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow dragging down
        if (gestureState.dy > 0) {
          translateY.setValue(lastGesture.current + gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // If dragged down more than 100px, close the modal
        if (gestureState.dy > 100) {
          closeModal();
        } else {
          // Otherwise, snap back to open position
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const openModal = useCallback(() => {
    translateY.setValue(MODAL_HEIGHT);
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  }, [translateY]);

  const closeModal = useCallback(() => {
    Animated.timing(translateY, {
      toValue: MODAL_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  }, [translateY, onClose]);

  const loadComments = useCallback(async () => {
    setLoading(true);
    const { data } = await musicApi.getComments(trackId);
    setComments(data || []);
    setLoading(false);
  }, [trackId]);

  useEffect(() => {
    if (visible) {
      void loadComments();
      openModal();
    }
  }, [visible, loadComments, openModal]);

  useEffect(() => {
    if (!visible) return;

    const unsubscribe = musicApi.subscribeToComments(trackId, (newComment) => {
      setComments((prev) => [newComment, ...(prev || [])]);
    });

    return () => {
      unsubscribe();
    };
  }, [visible, trackId]);

  const handleSubmit = async () => {
    if (!user?.id || !newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      const { data, error } = await musicApi.addComment(trackId, user.id, newComment);

      if (!error && data) {
        setComments((prev) => [data, ...(prev || [])]);
        setNewComment('');
      }
    } catch (err) {
      console.error('Failed to submit comment', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!user?.id) return;

    try {
      const { error } = await musicApi.deleteComment(commentId, user.id);

      if (!error) {
        setComments((prev) => (prev || []).filter((c) => c.id !== commentId));
      }
    } catch (err) {
      console.error('Failed to delete comment', err);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const renderComment = ({ item }: { item: Comment }) => {
    const isOwn = user?.id === item.userId;

    return (
      <View style={styles.commentItem}>
        <View style={styles.commentHeader}>
          <View style={styles.commentAvatar}>
            <Text style={styles.commentAvatarText}>
              {item.displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.commentMeta}>
            <Text style={styles.commentAuthor}>{item.displayName}</Text>
            <Text style={styles.commentTime}>{formatTime(item.createdAt)}</Text>
          </View>
          {isOwn && (
            <Pressable onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
              <Feather name="trash-2" size={16} color="#ef4444" />
            </Pressable>
          )}
        </View>
        <Text style={styles.commentText}>{item.comment}</Text>
      </View>
    );
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={closeModal}
      statusBarTranslucent
    >
      <View style={styles.modalContainer}>
        {/* Backdrop */}
        <Pressable style={styles.backdrop} onPress={closeModal} />

        {/* Bottom Sheet */}
        <Animated.View
          style={[
            styles.bottomSheet,
            {
              transform: [{ translateY }],
              height: MODAL_HEIGHT,
            },
          ]}
        >
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          {/* Drag Handle */}
          <View style={styles.handleContainer} {...panResponder.panHandlers}>
            <View style={styles.handle} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              Comments {comments.length > 0 ? `(${comments.length})` : ''}
            </Text>
          </View>

          {/* Comments List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#ffffff" />
            </View>
          ) : comments.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="message-circle" size={48} color="rgba(255, 255, 255, 0.5)" />
              <Text style={styles.emptyText}>No comments yet</Text>
              <Text style={styles.emptySubtext}>Be the first to comment!</Text>
            </View>
          ) : (
            <FlatList
              data={comments || []}
              renderItem={renderComment}
              keyExtractor={(item) => item?.id || Math.random().toString()}
              contentContainerStyle={styles.commentsList}
              showsVerticalScrollIndicator={false}
              removeClippedSubviews={false}
            />
          )}

          {/* Input */}
          {user ? (
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Add a comment..."
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                value={newComment}
                onChangeText={setNewComment}
                multiline
                maxLength={500}
                editable={!submitting}
              />
              <Pressable
                onPress={handleSubmit}
                disabled={!newComment.trim() || submitting}
                style={[
                  styles.sendButton,
                  (!newComment.trim() || submitting) && styles.sendButtonDisabled,
                ]}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Feather name="send" size={20} color="#ffffff" />
                )}
              </Pressable>
            </View>
          ) : (
            <View style={styles.signInPrompt}>
              <Text style={styles.signInText}>Sign in to leave a comment</Text>
            </View>
          )}
        </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  keyboardView: {
    flex: 1,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 2,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 8,
  },
  commentsList: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  commentItem: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(99, 102, 241, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  commentAvatarText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  commentMeta: {
    flex: 1,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  commentTime: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },
  deleteButton: {
    padding: 8,
  },
  commentText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
    marginLeft: 44,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'transparent',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#ffffff',
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  signInPrompt: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  signInText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
});

export const CommentModal = memo(CommentModalComponent);

export default CommentModal;
