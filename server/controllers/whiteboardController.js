const Document = require('../models/Document');
const User = require('../models/User');
const HttpError = require('../models/http_error');

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
      console.log(`Saving new document: ${whiteboardId}`);

      // Create new document
      const newDoc = new Document({
        whiteboardId,
        title,
        createdBy: userEmail,
        editorHTML,
        strokes,
        textBoxes,
        access: {
          visibility: 'restricted',
          users: [{ email: userEmail, role: 'owner' }]
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await newDoc.save();

      // Also update user access
      await User.findOneAndUpdate(
        { email: userEmail },
        {
          $addToSet: {
            documents: { whiteboardId, role: 'owner' }
          }
        },
        { upsert: true }
      );

      return res.status(200).json({ message: 'Document created successfully.' });

    } else {
      console.log(`Updating existing document: ${whiteboardId}`);

      // Overwrite all relevant fields
      existingDoc.editorHTML = editorHTML;
      existingDoc.strokes = strokes;
      existingDoc.textBoxes = textBoxes;
      existingDoc.title = title;
      existingDoc.updatedAt = new Date();

      await existingDoc.save();

      return res.status(200).json({ message: 'Document updated successfully.' });
    }
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
        accessLevel: userRole
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