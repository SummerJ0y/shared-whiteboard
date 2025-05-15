const Document = require('../models/Document');
const User = require('../models/User');
const HttpError = require('../models/http_error');

exports.getHistoryDocs = async (req, res, next) => {
    const { email } = req.query;
    if (!email) return next(new HttpError('Missing user email', 400));

    try {
        const user = await User.findOne({ email });
        if (!user) return next(new HttpError('User not found', 404));
        const whiteboardIds = user.documents.map(doc => doc.whiteboardId);
        const docs = await Document.find({ whiteboardId: { $in: whiteboardIds } });
        const enrichedDocs = docs.map(doc => {
            const role = user.documents.find(d => d.whiteboardId === doc.whiteboardId)?.role || 'read-only';
            return {
                whiteboardId: doc.whiteboardId,
                title: doc.title,
                updatedAt: doc.updatedAt,
                role
            };
        });
        return res.status(200).json({ historyDocs: enrichedDocs });
    } catch (err) {
        console.error(err);
        return next(new HttpError('Internal server error while fetching history docs', 500));
    }
};