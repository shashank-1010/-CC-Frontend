import { Request, Response } from 'express';
import Skill from '../models/Skill';
import { AuthRequest } from '../middleware/authMiddleware';

// 📝 Create Skill
export const createSkill = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, category, proficiencyLevel, whatsapp, tags } = req.body;

    if (!title || !description || !category) {
      res.status(400).json({ 
        success: false, 
        error: 'Title, description and category are required' 
      });
      return;
    }

    // Validate WhatsApp if provided
    if (whatsapp && !/^\d{10}$/.test(whatsapp)) {
      res.status(400).json({ 
        success: false, 
        error: 'WhatsApp number must be 10 digits' 
      });
      return;
    }

    const skill = await Skill.create({
      title,
      description,
      category,
      proficiencyLevel: proficiencyLevel || 'intermediate',
      whatsapp,
      tags: tags ? tags.split(',').map((t: string) => t.trim()) : [],
      userId: {
        _id: req.userId,
        name: req.userName,
        email: req.userEmail
        // 👇 Remove req.userWhatsapp if not in token
        // whatsapp: req.userWhatsapp  
      }
    });

    res.status(201).json({
      success: true,
      skill
    });
  } catch (error) {
    console.error('❌ Create skill error:', error);
    res.status(500).json({ 
      success: false, 
      error: (error as Error).message 
    });
  }
};

// 📥 Get All Skills
export const getSkills = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, proficiency, availability, search } = req.query;
    
    let query: any = {};  // Remove default availability filter
    
    // Apply filters
    if (category && category !== 'all') query.category = category;
    if (proficiency && proficiency !== 'all') query.proficiencyLevel = proficiency;
    if (availability && availability !== 'all') query.availability = availability;
    
    // Text search
    if (search) {
      query.$text = { $search: search as string };
    }

    const skills = await Skill.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      count: skills.length,
      skills
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: (error as Error).message 
    });
  }
};

// 📥 Get Single Skill
export const getSkillById = async (req: Request, res: Response): Promise<void> => {
  try {
    const skill = await Skill.findById(req.params.id);
    
    if (!skill) {
      res.status(404).json({ 
        success: false, 
        error: 'Skill not found' 
      });
      return;
    }
    
    // Increment views
    skill.views += 1;
    await skill.save();
    
    res.json({
      success: true,
      skill
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: (error as Error).message 
    });
  }
};

// ✏️ Update Skill - FIXED VERSION
export const updateSkill = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const skill = await Skill.findById(req.params.id);
    
    if (!skill) {
      res.status(404).json({ 
        success: false, 
        error: 'Skill not found' 
      });
      return;
    }
    
    // Check ownership
    if (skill.userId.toString() !== req.userId && skill.userId._id?.toString() !== req.userId) {
      res.status(403).json({ 
        success: false, 
        error: 'Not authorized to update this skill' 
      });
      return;
    }
    
    // Update fields
    const { title, description, category, proficiencyLevel, availability, whatsapp, tags } = req.body;
    
    if (title) skill.title = title;
    if (description) skill.description = description;
    if (category) skill.category = category;
    if (proficiencyLevel) skill.proficiencyLevel = proficiencyLevel;
    if (availability) skill.availability = availability;
    if (whatsapp) {
      if (!/^\d{10}$/.test(whatsapp)) {
        res.status(400).json({ 
          success: false, 
          error: 'WhatsApp number must be 10 digits' 
        });
        return;
      }
      skill.whatsapp = whatsapp;
    }
    if (tags) {
      skill.tags = Array.isArray(tags) 
        ? tags 
        : tags.split(',').map((t: string) => t.trim());
    }
    
    await skill.save();
    
    // Populate user data before sending response
    await skill.populate('userId', 'name email phone');
    
    res.json({
      success: true,
      skill
    });
  } catch (error) {
    console.error('❌ Update skill error:', error);
    res.status(500).json({ 
      success: false, 
      error: (error as Error).message 
    });
  }
};

// ❌ Delete Skill
export const deleteSkill = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const skill = await Skill.findById(req.params.id);
    
    if (!skill) {
      res.status(404).json({ 
        success: false, 
        error: 'Skill not found' 
      });
      return;
    }
    
    // ✅ FIXED: req.userId (not reqUserId)
    if (skill.userId._id.toString() !== req.userId) {
      res.status(403).json({ 
        success: false, 
        error: 'Not authorized to delete this skill' 
      });
      return;
    }
    
    await skill.deleteOne();
    
    res.json({
      success: true,
      message: 'Skill deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: (error as Error).message 
    });
  }
};

// 📥 Get User's Skills
export const getUserSkills = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const skills = await Skill.find({ 'userId._id': req.userId })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      skills
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: (error as Error).message 
    });
  }
};

// Get Categories
export const getCategories = async (req: Request, res: Response): Promise<void> => {
  const categories = [
    'Programming', 'Web Development', 'Mobile Development',
    'Design', 'Video Editing', 'Photo Editing',
    'Music', 'Dance', 'Sports', 'Fitness',
    'Cooking', 'Languages', 'Academics', 'Soft Skills',
    'Business', 'Marketing', 'Other'
  ];
  
  res.json({
    success: true,
    categories
  });
};