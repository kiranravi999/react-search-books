const SuccessView = (props) => {
  const { state } = props;
  const { data, count } = state;
  const startIndex = count * 10 - 10;
  const endIndex = count * 10;
  const slicedData = data.slice(startIndex, endIndex);

  return (
    <div>
      <ul className="list-group mt-4 mb-2">
        {slicedData.map((item) => (
          <li className="list-group-item" key={item.key}>
            <p className="m-0">
              <span className="fw-bold">Title:</span> {item.title}
            </p>
            <p className="m-0">
              <span className="fw-bold">Author:</span> {item.author_name}
            </p>
            <p className="m-0">
              <span className="fw-bold">First Published:</span>
              {item.first_publish_year}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SuccessView;
