const { v4: uuidv4 } = require("uuid");
const Document = require('../models/Document');
const User = require('../models/User');
const HttpError = require('../models/http_error');

exports.createWhiteboard = async (req, res, next) => {
  try {
    const newCanvasId = uuidv4();
    const newDoc = new Document({
      whiteboardId: newCanvasId,
      title: 'Untitled whiteboard',
      editorHTML: '',
      strokes: [],
      textBoxes: [],
      access: {
        visibility: 'public',
        users: [] // Empty initially
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await newDoc.save();

    return res.status(201).json({ canvasId: newCanvasId });
  } catch (error) {
    console.error('Error in createWhiteboard:', error);
    return next(new HttpError('Failed to create whiteboard.', 500));
  }
};

exports.saveWhiteboard = async (req, res, next) => {
  const {
    whiteboardId,
    editorHTML,
    strokes,
    textBoxes,
    userEmail,
    title
  } = req.body;

  if (!userEmail || !whiteboardId) {
    return next(new HttpError('Missing required fields.', 400));
  }

  try {
    // Check if document already exists
    const existingDoc = await Document.findOne({ whiteboardId });

    if (!existingDoc) {
      return next(new HttpError('Document not found. Cannot save.', 404));
    }

    console.log(`Updating document: ${whiteboardId}`);
    // Update content fields only
    existingDoc.editorHTML = editorHTML;
    existingDoc.strokes = strokes;
    existingDoc.textBoxes = textBoxes;
    existingDoc.title = title;
    existingDoc.updatedAt = new Date();

    const accessUsers = existingDoc.access.users;

    if(accessUsers.length === 0){ // first user of the doc -> the owner of the doc -> need to change in the future
      accessUsers.push({ email: userEmail, role: 'owner'});
    }
    else{
      const alreadyExists = accessUsers.some(user => user.email === userEmail);
      if(!alreadyExists){
        accessUsers.push({ email: userEmail, role: 'editor'});
      }
      // else: already present, do nothing
    }

    await existingDoc.save();

    // Optional: sync user access record (if tracking doc list per user)
    await User.findOneAndUpdate(
      { email: userEmail },
      {
        $addToSet: {
          documents: {
            whiteboardId,
            role: accessUsers.find(u => u.email === userEmail)?.role || 'editor'
          }
        }
      },
      { upsert: true }
    );

    return res.status(200).json({ message: 'Document updated successfully.' });
    
  } catch (error) {
    console.error('Error in saveWhiteboard:', error);
    return next(new HttpError('Internal server error while saving document.', 500));
  }
};

exports.loadWhiteboard = async (req, res, next) => {
  const { whiteboardId } = req.params;
  const { userEmail } = req.query;

  try {
    const doc = await Document.findOne({ whiteboardId });

    if (!doc) {
      return next(new HttpError('Whiteboard not found.', 404));
    }

    if(doc.access.visibility === 'public'){
      return res.status(200).json({
        editorHTML: doc.editorHTML,
        strokes: doc.strokes,
        textBoxes: doc.textBoxes,
        title: doc.title,
      });
    }
    
    if(!userEmail) {
      return next(new HttpError('This document is restricted. Please log in to view it.', 401));
    } 

    else{
      const accessEntry = doc.access.users.find(user => user.email === userEmail);
      const hasAccess = Boolean(accessEntry);

      if(!hasAccess) {
        return next(new HttpError('You do not have access to this document.', 403));
      }

      const userRole = accessEntry.role;
      console.log(`Document ${whiteboardId} loaded for ${userEmail} (role: ${userRole})`);
      return res.status(200).json({
        editorHTML: doc.editorHTML,
        strokes: doc.strokes,
        textBoxes: doc.textBoxes,
        title: doc.title,
        accessLevel: userRole
      });
    }  
  } catch (error) {
    console.error('Error in loadWhiteboard:', error);
    return next(new HttpError('Internal server error while loading document.', 500));
  }
};

// === Access Control === //

exports.getAccessInfo = async (req, res, next) => {
  const { whiteboardId } = req.params;
  try {
    const doc = await Document.findOne({ whiteboardId });
    if (!doc) return next(new HttpError('Document not found.', 404));

    return res.status(200).json({
      visibility: doc.access.visibility,
      users: doc.access.users
    });
  } catch (error) {
    console.error('Error in getAccessInfo:', error);
    return next(new HttpError('Failed to fetch access info.', 500));
  }
};

exports.inviteUser = async (req, res, next) => {
  const { whiteboardId, email } = req.body;
  if (!whiteboardId || !email) return next(new HttpError('Missing fields.', 400));

  try {
    const doc = await Document.findOne({ whiteboardId });
    if (!doc) return next(new HttpError('Document not found.', 404));

    const alreadyExists = doc.access.users.find(user => user.email === email);
    if (alreadyExists) return res.status(200).json({ message: 'User already invited.' });

    doc.access.users.push({ email, role: 'read-only' });
    await doc.save();

    return res.status(200).json({ message: 'User invited successfully.' });
  } catch (error) {
    console.error('Error in inviteUser:', error);
    return next(new HttpError('Failed to invite user.', 500));
  }
};

exports.updateVisibility = async (req, res, next) => {
  const { whiteboardId, visibility } = req.body;
  if (!whiteboardId || !visibility) return next(new HttpError('Missing fields.', 400));

  try {
    const doc = await Document.findOne({ whiteboardId });
    if (!doc) return next(new HttpError('Document not found.', 404));

    doc.access.visibility = visibility;
    await doc.save();

    return res.status(200).json({ message: 'Visibility updated.' });
  } catch (error) {
    console.error('Error in updateVisibility:', error);
    return next(new HttpError('Failed to update visibility.', 500));
  }
};

exports.updateUserRole = async (req, res, next) => {
  const { whiteboardId, email, role } = req.body;
  if (!whiteboardId || !email || !role) {
    return next(new HttpError('Missing fields.', 400));
  }

  if (role === 'owner') {
    return next(new HttpError('Cannot assign owner role to others.', 403));
  }

  try {
    const doc = await Document.findOne({ whiteboardId });
    if (!doc) return next(new HttpError('Document not found.', 404));

    const ownerEmail = doc.createdBy;
    if (email === ownerEmail) {
      return next(new HttpError('Owner cannot change their own role.', 403));
    }

    const user = doc.access.users.find(u => u.email === email);
    if (!user) return next(new HttpError('User not found in document.', 404));

    user.role = role;
    await doc.save();

    return res.status(200).json({ message: 'User role updated.' });
  } catch (error) {
    console.error('Error in updateUserRole:', error);
    return next(new HttpError('Failed to update user role.', 500));
  }
};

exports.removeUser = async (req, res, next) => {
  const { whiteboardId, email } = req.body;
  if (!whiteboardId || !email) return next(new HttpError('Missing fields.', 400));

  try {
    const doc = await Document.findOne({ whiteboardId });
    if (!doc) return next(new HttpError('Document not found.', 404));

    doc.access.users = doc.access.users.filter(user => user.email !== email);
    await doc.save();

    return res.status(200).json({ message: 'User removed successfully.' });
  } catch (error) {
    console.error('Error in removeUser:', error);
    return next(new HttpError('Failed to remove user.', 500));
  }
};