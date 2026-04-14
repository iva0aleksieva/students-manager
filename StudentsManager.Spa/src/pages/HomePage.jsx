import robotImage from '../assets/home/robot.png';

function HomePage() {
	return (
		<section className="section">
			<div className="intro-test-section fh anim-block">
				<div className="section-box">
					<div className="intro-test-txt center">
						<div className="intro-test-txt-box white-box center anim-elem top-visibility done">
							<div className="addition-txt-box">
								<span className="p-huge lightGrey addition-txt">Welcome group 37 - MUT</span>
							</div>
						</div>
						<div className="image-item anim-elem left-100 done">
							<div className="boy-image">
                                <img
                                    src={robotImage}
                                    alt="robot"
                                    className="template-image"
                                />
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

export default HomePage;
