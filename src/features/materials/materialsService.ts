import { queryMany, querySingle, execute, rawQuery } from '../../lib/neon';
import { isNeonConfigured } from '../../lib/config';
import { LocalDataStore } from '../../lib/storage';
import { LearningMaterial, MaterialCategory, DifficultyLevel, MaterialStatus } from '../../types/materials';

export interface MaterialFilter {
  category?: MaterialCategory | 'ALL';
  difficulty?: DifficultyLevel | 'ALL';
  search?: string;
  teacherId?: string;
  status?: MaterialStatus;
  publishedOnly?: boolean;
}

export const MaterialsService = {
  async getAll(filter?: MaterialFilter, studentId?: string): Promise<LearningMaterial[]> {
    if (!isNeonConfigured) {
      const list = await LocalDataStore.getMaterials();
      let filteredList = list;
      if (filter?.publishedOnly) filteredList = filteredList.filter((m) => m.status === 'published');
      if (filter?.teacherId) filteredList = filteredList.filter((m) => m.teacher_id === filter.teacherId);
      if (filter?.category && filter.category !== 'ALL') filteredList = filteredList.filter((m) => m.category === filter.category);
      if (filter?.difficulty && filter.difficulty !== 'ALL') filteredList = filteredList.filter((m) => m.difficulty === filter.difficulty);
      if (filter?.search && filter.search.trim().length > 0) {
        const q = filter.search.toLowerCase();
        filteredList = filteredList.filter((m) => m.title.toLowerCase().includes(q) || m.description.toLowerCase().includes(q) || m.category.toLowerCase().includes(q));
      }
      if (studentId) {
        const progress = await LocalDataStore.getMaterialProgress(studentId);
        const completedMap = new Set(progress.filter((p) => p.is_completed).map((p) => p.material_id));
        filteredList = filteredList.map((m) => ({ ...m, is_completed: completedMap.has(m.id) }));
      }
      return filteredList;
    }

    // Build dynamic query using rawQuery with parameterized values
    const conditions: string[] = [];
    const values: unknown[] = [];

    if (filter?.publishedOnly) {
      conditions.push('status = \'published\'');
    }
    if (filter?.teacherId) {
      values.push(filter.teacherId);
      conditions.push(`teacher_id = $${values.length}`);
    }
    if (filter?.category && filter.category !== 'ALL') {
      values.push(filter.category);
      conditions.push(`category = $${values.length}`);
    }
    if (filter?.difficulty && filter.difficulty !== 'ALL') {
      values.push(filter.difficulty);
      conditions.push(`difficulty = $${values.length}`);
    }
    if (filter?.search && filter.search.trim().length > 0) {
      values.push(`%${filter.search.toLowerCase()}%`);
      conditions.push(`(LOWER(title) LIKE $${values.length} OR LOWER(description) LIKE $${values.length} OR LOWER(category) LIKE $${values.length})`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    const query = `
      SELECT 
        id, teacher_id, title, slug, category, difficulty, description, content,
        cover_image_url, attachment_url, attachment_name, reading_time_minutes,
        status, order_index, created_at, updated_at
      FROM public.learning_materials
      ${whereClause}
      ORDER BY order_index ASC, created_at DESC
    `;

    const materials = await rawQuery<LearningMaterial>(query, values);

    if (studentId && materials.length > 0) {
      const materialIds = materials.map(m => `'${m.id}'`).join(',');
      const progressQuery = `
        SELECT material_id FROM public.material_progress
        WHERE student_id = $1 AND material_id IN (${materialIds}) AND is_completed = true
      `;
      const progress = await rawQuery<{ material_id: string }>(progressQuery, [studentId]);
      const completedMap = new Set(progress.map(p => p.material_id));
      return materials.map(m => ({ ...m, is_completed: completedMap.has(m.id) }));
    }

    return materials;
  },

  async getById(id: string, studentId?: string): Promise<LearningMaterial | null> {
    if (!isNeonConfigured) {
      let item = await LocalDataStore.getMaterialById(id);
      if (item && studentId) {
        const progress = await LocalDataStore.getMaterialProgress(studentId);
        const found = progress.find((p) => p.material_id === id && p.is_completed);
        if (found) item = { ...item, is_completed: true };
      }
      return item;
    }

    const materials = await queryMany<LearningMaterial>`
      SELECT 
        id, teacher_id, title, slug, category, difficulty, description, content,
        cover_image_url, attachment_url, attachment_name, reading_time_minutes,
        status, order_index, created_at, updated_at
      FROM public.learning_materials
      WHERE id = ${id}
    `;

    const material = materials[0] || null;

    if (material && studentId) {
      const progress = await queryMany<{ material_id: string }>`
        SELECT material_id FROM public.material_progress
        WHERE student_id = ${studentId} AND material_id = ${id} AND is_completed = true
      `;
      material.is_completed = progress.length > 0;
    }

    return material;
  },

  async create(material: Omit<LearningMaterial, 'id' | 'created_at' | 'updated_at'>): Promise<LearningMaterial> {
    if (!isNeonConfigured) {
      const newItem: LearningMaterial = {
        ...material,
        id: `mat-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      await LocalDataStore.saveMaterial(newItem);
      return newItem;
    }

    const result = await querySingle<LearningMaterial>`
      INSERT INTO public.learning_materials (
        teacher_id, title, slug, category, difficulty, description, content,
        cover_image_url, attachment_url, attachment_name, reading_time_minutes,
        status, order_index
      ) VALUES (
        ${material.teacher_id}, ${material.title}, ${material.slug}, ${material.category},
        ${material.difficulty}, ${material.description}, ${material.content},
        ${material.cover_image_url ?? null}, ${material.attachment_url ?? null},
        ${material.attachment_name ?? null}, ${material.reading_time_minutes},
        ${material.status}, ${material.order_index}
      )
      RETURNING 
        id, teacher_id, title, slug, category, difficulty, description, content,
        cover_image_url, attachment_url, attachment_name, reading_time_minutes,
        status, order_index, created_at, updated_at
    `;

    return result;
  },

  async update(id: string, updates: Partial<LearningMaterial>): Promise<void> {
    if (!isNeonConfigured) {
      const existing = await LocalDataStore.getMaterialById(id);
      if (existing) {
        await LocalDataStore.saveMaterial({ ...existing, ...updates, updated_at: new Date().toISOString() });
      }
      return;
    }

    const setClauses: string[] = [];
    const params: unknown[] = [id];

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at' && key !== 'updated_at' && key !== 'teacher_name' && key !== 'is_completed') {
        params.push(value);
        setClauses.push(`${key} = $${params.length}`);
      }
    });

    if (setClauses.length === 0) return;

    params.push(new Date().toISOString());
    setClauses.push(`updated_at = $${params.length}`);

    const query = `UPDATE public.learning_materials SET ${setClauses.join(', ')} WHERE id = $1`;
    await rawQuery(query, params);
  },

  async delete(id: string): Promise<void> {
    if (!isNeonConfigured) {
      await LocalDataStore.deleteMaterial(id);
      return;
    }
    await execute`DELETE FROM public.learning_materials WHERE id = ${id}`;
  },

  async markAsCompleted(studentId: string, materialId: string): Promise<boolean> {
    if (!isNeonConfigured) {
      await LocalDataStore.markMaterialCompleted(studentId, materialId);
      return true;
    }

    await execute`
      INSERT INTO public.material_progress (student_id, material_id, is_completed, completed_at, last_accessed_at)
      VALUES (${studentId}, ${materialId}, true, NOW(), NOW())
      ON CONFLICT (student_id, material_id)
      DO UPDATE SET is_completed = true, completed_at = NOW(), last_accessed_at = NOW()
    `;
    return true;
  },
};