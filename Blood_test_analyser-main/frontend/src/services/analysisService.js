import { getDatabase } from './mongodb';
const { ObjectId } = require('mongodb');

// Analysis Service - Handle all analysis history operations

export async function saveAnalysis(userId, analysisData) {
  const db = getDatabase();
  const historyCollection = db.collection('analysis_history');

  try {
    const result = await historyCollection.insertOne({
      user_id: new ObjectId(userId),
      results: analysisData.results,
      patient_info: analysisData.patient_info || null,
      analysis_response: analysisData.analysis_response,
      created_at: new Date()
    });

    return {
      id: result.insertedId,
      ...analysisData,
      created_at: new Date()
    };
  } catch (error) {
    throw new Error(`Failed to save analysis: ${error.message}`);
  }
}

export async function getAnalysisHistory(userId, limit = 10) {
  const db = getDatabase();
  const historyCollection = db.collection('analysis_history');

  try {
    const history = await historyCollection
      .find({ user_id: new ObjectId(userId) })
      .sort({ created_at: -1 })
      .limit(limit)
      .toArray();

    return history;
  } catch (error) {
    throw new Error(`Failed to fetch analysis history: ${error.message}`);
  }
}

export async function getAnalysisById(analysisId) {
  const db = getDatabase();
  const historyCollection = db.collection('analysis_history');

  try {
    const analysis = await historyCollection.findOne({
      _id: new ObjectId(analysisId)
    });

    return analysis;
  } catch (error) {
    throw new Error(`Failed to fetch analysis: ${error.message}`);
  }
}

export async function deleteAnalysis(analysisId, userId) {
  const db = getDatabase();
  const historyCollection = db.collection('analysis_history');

  try {
    // Verify ownership before deleting
    const analysis = await historyCollection.findOne({
      _id: new ObjectId(analysisId),
      user_id: new ObjectId(userId)
    });

    if (!analysis) {
      throw new Error('Analysis not found or unauthorized');
    }

    const result = await historyCollection.deleteOne({
      _id: new ObjectId(analysisId)
    });

    return result.deletedCount > 0;
  } catch (error) {
    throw new Error(`Failed to delete analysis: ${error.message}`);
  }
}

export async function updateAnalysis(analysisId, userId, updatedData) {
  const db = getDatabase();
  const historyCollection = db.collection('analysis_history');

  try {
    const result = await historyCollection.updateOne(
      {
        _id: new ObjectId(analysisId),
        user_id: new ObjectId(userId)
      },
      {
        $set: {
          ...updatedData,
          updated_at: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      throw new Error('Analysis not found or unauthorized');
    }

    return result.modifiedCount > 0;
  } catch (error) {
    throw new Error(`Failed to update analysis: ${error.message}`);
  }
}
