# Load environment variables from .env file
include .env
export $(shell sed 's/=.*//' .env)

createblog:
	@curl -X POST http://localhost:9901/blogs \
		-H "Content-Type: application/json" \
		-H "x-api-password: $(BLOG_API_PASSWORD)" \
		-d '{"title": "My First Blog","content": "This is the content of my first blog post.","author": "John Doe"}'

getallblogs:
	@curl -X GET http://localhost:9901/blogs

getblog:
	@curl -X GET http://localhost:9901/blogs/1730247076215

updateblog:
	@curl -X PUT http://localhost:9901/blogs/1730247076215 \
	-H "Content-Type: application/json" \
	-H "x-api-password: $(BLOG_API_PASSWORD)" \
	-d '{"title": "Updated Blog Title","content": "This is the updated content of my blog post.","author": "John Doe"}'

deleteblog:
	@curl -X DELETE http://localhost:9901/blogs/1730247076215 \
	-H "x-api-password: $(BLOG_API_PASSWORD)"
