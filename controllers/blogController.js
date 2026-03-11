const db = require('../config/database');

const listBlogsPublic = async (req, res, next) => {
  try {
    const blogs = await db('blogs')
      .where({ is_published: true })
      .orderBy([
        { column: 'published_at', order: 'desc' },
        { column: 'created_at', order: 'desc' }
      ])
      .select('id', 'title', 'slug', 'excerpt', 'featured_image_url', 'published_at', 'created_at');

    res.json({ blogs });
  } catch (error) {
    next(error);
  }
};

const listBlogsAdmin = async (req, res, next) => {
  try {
    const blogs = await db('blogs')
      .orderBy([{ column: 'created_at', order: 'desc' }])
      .select('*');

    res.json({ blogs });
  } catch (error) {
    next(error);
  }
};

const getBlogBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const blog = await db('blogs')
      .where({ slug, is_published: true })
      .first();

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    res.json({ blog });
  } catch (error) {
    next(error);
  }
};

function generateSlug(title) {
  if (!title) return null;
  return title
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 200);
}

const createBlog = async (req, res, next) => {
  try {
    const {
      title,
      slug,
      excerpt,
      content,
      featuredImageUrl,
      seoTitle,
      seoDescription,
      seoKeywords,
      isPublished
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    let finalSlug = slug || generateSlug(title);
    if (!finalSlug) {
      return res.status(400).json({ error: 'Invalid slug' });
    }

    const existing = await db('blogs').where({ slug: finalSlug }).first();
    if (existing) {
      finalSlug = `${finalSlug}-${Date.now()}`;
    }

    const is_published = Boolean(isPublished);
    const published_at = is_published ? new Date() : null;

    const [created] = await db('blogs')
      .insert({
        title,
        slug: finalSlug,
        excerpt: excerpt || null,
        content,
        featured_image_url: featuredImageUrl || null,
        seo_title: seoTitle || null,
        seo_description: seoDescription || null,
        seo_keywords: seoKeywords || null,
        is_published,
        published_at
      })
      .returning('*');

    res.status(201).json({ message: 'Blog created successfully', blog: created });
  } catch (error) {
    next(error);
  }
};

const updateBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      excerpt,
      content,
      featuredImageUrl,
      seoTitle,
      seoDescription,
      seoKeywords,
      isPublished
    } = req.body;

    const blog = await db('blogs').where({ id }).first();
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    let finalSlug = slug || blog.slug || generateSlug(title || blog.title);
    if (!finalSlug) {
      return res.status(400).json({ error: 'Invalid slug' });
    }

    if (finalSlug !== blog.slug) {
      const existing = await db('blogs')
        .where({ slug: finalSlug })
        .whereNot({ id })
        .first();
      if (existing) {
        finalSlug = `${finalSlug}-${Date.now()}`;
      }
    }

    const is_published = typeof isPublished === 'boolean' ? isPublished : blog.is_published;
    let published_at = blog.published_at;
    if (is_published && !blog.is_published && !blog.published_at) {
      published_at = new Date();
    }

    const [updated] = await db('blogs')
      .where({ id })
      .update({
        title: title ?? blog.title,
        slug: finalSlug,
        excerpt: excerpt ?? blog.excerpt,
        content: content ?? blog.content,
        featured_image_url: featuredImageUrl ?? blog.featured_image_url,
        seo_title: seoTitle ?? blog.seo_title,
        seo_description: seoDescription ?? blog.seo_description,
        seo_keywords: seoKeywords ?? blog.seo_keywords,
        is_published,
        published_at
      })
      .returning('*');

    res.json({ message: 'Blog updated successfully', blog: updated });
  } catch (error) {
    next(error);
  }
};

const deleteBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedCount = await db('blogs').where({ id }).del();

    if (!deletedCount) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listBlogsPublic,
  listBlogsAdmin,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog
};

