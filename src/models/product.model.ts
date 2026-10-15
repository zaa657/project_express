import { getPool } from '../config/database';

export interface IProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string | null;
  userId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

export class ProductModel {
  static async getAll(search?: string, category?: string): Promise<IProduct[]> {
    const db = getPool();
    let query = `
      SELECT 
        id, 
        name, 
        description, 
        CAST(price AS DOUBLE) as price, 
        category, 
        image_url as imageUrl, 
        user_id as userId, 
        author_name as authorName, 
        created_at as createdAt, 
        updated_at as updatedAt 
      FROM products 
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search) {
      query += ` AND (LOWER(name) LIKE ? OR LOWER(description) LIKE ? OR LOWER(category) LIKE ?)`;
      const searchPattern = `%${search.toLowerCase()}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    if (category && category !== 'all') {
      query += ` AND LOWER(category) = LOWER(?)`;
      params.push(category);
    }

    query += ` ORDER BY created_at DESC`;

    const [rows]: any = await db.query(query, params);
    return rows as IProduct[];
  }

  static async findById(id: string): Promise<IProduct | null> {
    const db = getPool();
    const [rows]: any = await db.query(
      `SELECT 
        id, 
        name, 
        description, 
        CAST(price AS DOUBLE) as price, 
        category, 
        image_url as imageUrl, 
        user_id as userId, 
        author_name as authorName, 
        created_at as createdAt, 
        updated_at as updatedAt 
      FROM products 
      WHERE id = ? 
      LIMIT 1`,
      [id]
    );

    if (rows.length === 0) return null;
    return rows[0] as IProduct;
  }

  static async create(
    productData: Omit<IProduct, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<IProduct> {
    const db = getPool();
    const id = 'prod_' + Date.now() + '_' + Math.floor(Math.random() * 1000);

    await db.query(
      `INSERT INTO products (id, name, description, price, category, image_url, user_id, author_name) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        productData.name,
        productData.description,
        productData.price,
        productData.category,
        productData.imageUrl,
        productData.userId,
        productData.authorName
      ]
    );

    const created = await this.findById(id);
    return created!;
  }

  static async update(
    id: string,
    updates: Partial<Omit<IProduct, 'id' | 'userId' | 'createdAt'>>
  ): Promise<IProduct | null> {
    const db = getPool();

    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description);
    }
    if (updates.price !== undefined) {
      fields.push('price = ?');
      values.push(updates.price);
    }
    if (updates.category !== undefined) {
      fields.push('category = ?');
      values.push(updates.category);
    }
    if (updates.imageUrl !== undefined) {
      fields.push('image_url = ?');
      values.push(updates.imageUrl);
    }

    if (fields.length === 0) {
      return await this.findById(id);
    }

    values.push(id);
    await db.query(
      `UPDATE products SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return await this.findById(id);
  }

  static async delete(id: string): Promise<boolean> {
    const db = getPool();
    const [result]: any = await db.query('DELETE FROM products WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}
