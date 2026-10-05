import { Request, Response, NextFunction } from 'express';
import { Member } from '../models/Member';
import { createMemberSchema, memberQuerySchema } from '../validators/member.validator';
import { AppError } from '../middleware/errorHandler';

export async function createMember(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const validatedData = createMemberSchema.parse(req.body);

    // Check duplicate email
    const existingEmail = await Member.findOne({ email: validatedData.email });
    if (existingEmail) {
      throw new AppError(`A member with email ${validatedData.email} already exists`, 409);
    }

    // Check duplicate membershipId
    const existingMembershipId = await Member.findOne({ membershipId: validatedData.membershipId });
    if (existingMembershipId) {
      throw new AppError(`A member with membership ID ${validatedData.membershipId} already exists`, 409);
    }

    const member = await Member.create(validatedData);

    res.status(201).json({
      success: true,
      message: 'Member registered successfully',
      data: member,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMembers(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = memberQuerySchema.parse(req.query);
    const { page, limit, search } = query;

    const filter: any = {};
    if (search && search.trim() !== '') {
      const term = search.trim();
      filter.$or = [
        { name: { $regex: term, $options: 'i' } },
        { email: { $regex: term, $options: 'i' } },
        { membershipId: { $regex: term, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [members, total] = await Promise.all([
      Member.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Member.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit) || (total === 0 ? 0 : 1);

    res.status(200).json({
      success: true,
      data: members,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getMemberById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const member = await Member.findById(id);
    if (!member) {
      throw new AppError('Member not found', 404);
    }

    res.status(200).json({
      success: true,
      data: member,
    });
  } catch (error) {
    next(error);
  }
}
