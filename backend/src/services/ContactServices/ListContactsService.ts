import { Filterable, Includeable, Op, Sequelize } from "sequelize";
import Contact from "../../models/Contact";
import Tag from "../../models/Tag";

interface Request {
  searchParam?: string;
  pageNumber?: string;
  tags?: number[];
}

interface Response {
  contacts: Contact[];
  count: number;
  hasMore: boolean;
}

const ListContactsService = async ({
  searchParam = "",
  pageNumber = "1",
  tags
}: Request): Promise<Response> => {
  const whereCondition: any = {
    [Op.or]: [
      {
        name: Sequelize.where(
          Sequelize.fn("LOWER", Sequelize.col("Contact.name")),
          "LIKE",
          `%${searchParam.toLowerCase().trim()}%`
        )
      },
      {
        number: { [Op.like]: `%${searchParam.toLowerCase().trim()}%` }
      },
      {
        email: Sequelize.where(
          Sequelize.fn("LOWER", Sequelize.col("Contact.email")),
          "LIKE",
          `%${searchParam.toLowerCase().trim()}%`
        )
      }
    ]
  };

  const includeCondition: Includeable[] = [
    {
      model: Tag,
      as: "tags",
      attributes: ["id", "name", "color"]
    }
  ];
  
  if (Array.isArray(tags) && tags.length > 0) {
    includeCondition[0] = {
      model: Tag,
      as: "tags",
      required: true,
      where: {
        id: { [Op.in]: tags }
      },
      attributes: ["id", "name", "color"],
      through: { attributes: [] }
    };
  }

  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: contacts } = await Contact.findAndCountAll({
    where: whereCondition,
    include: includeCondition,
    limit,
    offset,
    order: [["name", "ASC"]]
  });

  const hasMore = count > offset + contacts.length;

  return {
    contacts,
    count,
    hasMore
  };
};

export default ListContactsService;
