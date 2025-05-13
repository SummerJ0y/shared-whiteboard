const Document = require('../models/Document');
const User = require('../models/User');

exports.saveWhiteboard = async (req, res) => {
  const {
    whiteboardId,
    editorHTML,
    strokes,
    textBoxes,
    userEmail,
    title
  } = req.body;

  if (!userEmail || !whiteboardId) {
    return res.status(400).json({ error: 'Missing required fields.' });
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
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};


exports.loadWhiteboard = async (req, res) => {
  const { whiteboardId } = req.params;
  const { userEmail } = req.query;

  if (!whiteboardId || !userEmail) {
    console.warn('Missing whiteboardId or userEmail in request');
    return res.status(400).json({ error: 'Missing whiteboardId or userEmail.' });
  }

  try {
    const doc = await Document.findOne({ whiteboardId });

    if (!doc) {
      console.warn(`Document not found: ${whiteboardId}`);
      return res.status(404).json({ error: 'Whiteboard not found.' });
    }

    const isPublic = doc.access.visibility === 'public';
    const accessEntry = doc.access.users.find(user => user.email === userEmail);
    const hasAccess = Boolean(accessEntry);

    if (!isPublic && !hasAccess) {
      console.warn(`Access denied for user ${userEmail} on whiteboard ${whiteboardId}`);
      return res.status(403).json({ error: 'Access denied.' });
    }

    const userRole = hasAccess ? accessEntry.role : 'read-only';

    console.log(`Document ${whiteboardId} loaded for ${userEmail} (role: ${userRole})`);

    return res.status(200).json({
      editorHTML: doc.editorHTML,
      strokes: doc.strokes,
      textBoxes: doc.textBoxes,
      title: doc.title,
      accessLevel: userRole
    });
  } catch (error) {
    console.error('Error in loadWhiteboard:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};