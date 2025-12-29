const prisma = require('../prisma/client')
const slugify = require('slugify')
const { validateRequest } = require('../utils/validate')
const { createEventSchema, updateEventSchema } = require('../validators/event.validator')
const { parsePaginationParams, buildPaginationResponse } = require('../utils/pagination');
const { buildSearchQuery } = require('../utils/search');

const create = async (data) => {

    const { name, description, start_date, end_date, status } = validateRequest(createEventSchema, data)

    if (new Date(start_date) >= new Date(end_date)) {
        throw new Error("End date must be greater than start date");
    }

    const date = new Date()

    if (start_date <= date && end_date >= date) {
        status = 'active'
    }
    else if (start_date > date) {
        status = 'upcoming'
    } else {
        status = 'ended'
    }

    // Generate slug
    const slug = slugify(name, {
        lower: true,
        strict: true,
        replacement: '-',
        trim: true
    })

    const exist = await prisma.event.findUnique({
        where: {
            slug: slug
        }
    })

    if (exist) throw new Error("Slug already exist. Try to create another one");

    return await prisma.event.create({
        data: {
            name,
            slug,
            description,
            start_date,
            end_date,
            status
        }
    })
}

const update = async (id, data) => {
    const exist = await prisma.event.findUnique({
        where: { id }
    })
    if (!exist) throw new Error("Event not found");

    const { name, description, start_date, end_date, status } = validateRequest(updateEventSchema, data)

    if (start_date && end_date) {
        if (new Date(start_date) >= new Date(end_date)) {
            throw new Error("End date must be greater than start date");
        }
    }

    const date = new Date()

    if (start_date <= date && end_date >= date) {
        status = 'active'
    }
    else if (start_date > date) {
        status = 'upcoming'
    } else {
        status = 'ended'
    }

    if (name) {
        const newSlug = slugify(name, {
            lower: true,
            strict: true,
            replacement: '-',
            trim: true
        })

        const slugExist = await prisma.event.findFirst({
            where: {
                slug: newSlug,
                id: {
                    not: id
                }
            }
        })

        if (slugExist) throw new Error("Slug already exist. Try to create another one");

        data.slug = newSlug
    }

    return await prisma.event.update({
        where: { id },
        data: {
            name,
            description,
            start_date,
            end_date,
            status
        }
    })
}

const remove = async (id) => {
    const event = await prisma.event.findUnique({
        where: {
            id
        }
    })

    if (!event) throw new Error("Event not found");

    return await prisma.event.update({
        where: {
            id
        },
        data: {
            deleted_at: new Date()
        }
    })
}

const getAll = async (query = {}) => {
    const { page, limit, skip } = parsePaginationParams(query);
    const { search } = query;

    const where = {
        deleted_at: null
    };

    if (search) {
        Object.assign(where, buildSearchQuery(search, ['name', 'description', 'status']));
    }

    const [events, total] = await Promise.all([
        prisma.event.findMany({
            where,
            orderBy: { start_date: 'desc' },
            skip,
            take: limit
        }),
        prisma.event.count({ where })
    ]);

    return buildPaginationResponse(page, limit, total, events);
}

const getOne = async (id) => {
    const event = await prisma.event.findUnique({
        where: {
            id
        },
        include: {
            products: true
        }
    })

    if (!event) throw new Error("Event not found");
    return event
}

module.exports = {
    create,
    update,
    remove,
    getAll,
    getOne
}